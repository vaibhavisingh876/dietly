import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserProfile, { PROFILE_ENUMS } from "../models/UserProfile.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, country } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: (name || "").trim(),
      email: normalizedEmail,
      password: hashedPassword,
      country: country || "",
    });
    await newUser.save();

    const newProfile = new UserProfile({ userId: newUser._id });
    await newProfile.save();

    newUser.profile = newProfile._id;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).populate("profile");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
        country: user.country || "",
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET current user + profile (source of truth for Profile page & Questionnaire)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("profile").select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT profile update — used by both Profile page edits and the Questionnaire.
// Merges provided fields; never wipes out fields the caller didn't send.
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, age, height, weight, gender, dietaryPreferences, allergies, healthGoals, lifestyle, calorieGoalOverride } = req.body;

    // Validation
    if (age !== undefined && age !== null && age !== "" && (isNaN(age) || age < 0 || age > 120)) {
      return res.status(400).json({ success: false, message: "Invalid age" });
    }
    if (height !== undefined && height !== null && height !== "" && (isNaN(height) || height < 0)) {
      return res.status(400).json({ success: false, message: "Invalid height" });
    }
    if (weight !== undefined && weight !== null && weight !== "" && (isNaN(weight) || weight < 0)) {
      return res.status(400).json({ success: false, message: "Invalid weight" });
    }
    if (gender !== undefined && gender !== null && gender !== "" && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ success: false, message: "Invalid gender" });
    }
    if (dietaryPreferences !== undefined && dietaryPreferences !== null && dietaryPreferences !== "" &&
        !PROFILE_ENUMS.DIETARY_PREFERENCES.includes(dietaryPreferences)) {
      return res.status(400).json({ success: false, message: "Invalid dietary preference" });
    }
    if (allergies !== undefined && (!Array.isArray(allergies) || allergies.some((a) => !PROFILE_ENUMS.ALLERGIES.includes(a)))) {
      return res.status(400).json({ success: false, message: "Invalid allergies" });
    }
    if (healthGoals !== undefined && (!Array.isArray(healthGoals) || healthGoals.some((g) => !PROFILE_ENUMS.HEALTH_GOALS.includes(g)))) {
      return res.status(400).json({ success: false, message: "Invalid health goals" });
    }
    if (lifestyle !== undefined && lifestyle !== null && lifestyle !== "" && !PROFILE_ENUMS.LIFESTYLES.includes(lifestyle)) {
      return res.status(400).json({ success: false, message: "Invalid lifestyle" });
    }

    // Update name on User if provided
    if (name !== undefined) {
      await User.findByIdAndUpdate(req.user.id, { name: String(name).trim() });
    }

    // Build a sparse update so we only touch fields the client actually sent
    const profileUpdate = {};
    if (age !== undefined && age !== "") profileUpdate.age = age;
    if (height !== undefined && height !== "") profileUpdate.height = height;
    if (weight !== undefined && weight !== "") profileUpdate.weight = weight;
    if (gender !== undefined && gender !== "") profileUpdate.gender = gender;
    if (dietaryPreferences !== undefined && dietaryPreferences !== "") profileUpdate.dietaryPreferences = dietaryPreferences;
    if (allergies !== undefined) profileUpdate.allergies = allergies;
    if (healthGoals !== undefined) profileUpdate.healthGoals = healthGoals;
    if (lifestyle !== undefined && lifestyle !== "") profileUpdate.lifestyle = lifestyle;
    if (calorieGoalOverride !== undefined) profileUpdate.calorieGoalOverride = calorieGoalOverride || undefined;

    let profile = await UserProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new UserProfile({ userId: req.user.id });
    }
    Object.assign(profile, profileUpdate);

    // Mark onboarding complete once the core questionnaire fields are present
    if (profile.age && profile.height && profile.weight && profile.gender && profile.lifestyle) {
      profile.questionnaireCompleted = true;
    }

    await profile.save();

    const updatedUser = await User.findById(req.user.id).select("-password");

    res.json({ success: true, profile, user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;