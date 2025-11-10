// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, country } = req.body;

    if (!email || !password || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, country });
    await newUser.save();

    // Optional: create empty profile for the user
    const newProfile = new UserProfile({ userId: newUser._id });
    await newProfile.save();

    newUser.profile = newProfile._id;
    await newUser.save();

    console.log("✅ Registered user:", { id: newUser._id, email: newUser.email });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id,
    });

  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).populate("profile");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile || {}, // full profile object
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 GET PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("profile");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile || {},
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
