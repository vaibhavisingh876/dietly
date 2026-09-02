import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import UserProfile, {
  PROFILE_ENUMS,
} from "../models/Userprofile.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const MAX_AGE = 120;
const MAX_HEIGHT_CM = 300;
const MAX_WEIGHT_KG = 500;
const MAX_CALORIE_GOAL = 5000;

// --------------------------------------------------
// HELPER
// --------------------------------------------------

const buildUserResponse = (user) => {
  const profile =
    user.profile &&
    typeof user.profile === "object"
      ? user.profile
      : null;

  return {
    id: user._id,
    name: user.name || "",
    email: user.email,
    country: user.country || "",
    profile,
    questionnaireCompleted:
      Boolean(
        profile?.questionnaireCompleted
      ),
  };
};

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

router.post(
  "/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        country,
      } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Name is required",
        });
      }

      if (
        !email?.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password required",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "User already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const newUser =
        new User({
          name: name.trim(),
          email: normalizedEmail,
          password:
            hashedPassword,
          country:
            country || "",
        });

      await newUser.save();

      const newProfile =
        new UserProfile({
          userId: newUser._id,
          questionnaireCompleted:
            false,
        });

      await newProfile.save();

      newUser.profile =
        newProfile._id;

      await newUser.save();

      return res.status(201).json({
        success: true,
        message:
          "User registered successfully",
        userId: newUser._id,
      });
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email?.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password required",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const user =
        await User.findOne({
          email: normalizedEmail,
        }).populate("profile");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid credentials",
        });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message:
            "Server configuration error",
        });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

      return res.json({
        success: true,
        token,
        user:
          buildUserResponse(
            user
          ),
      });
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);

// --------------------------------------------------
// GET CURRENT USER + PROFILE
// --------------------------------------------------

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        )
          .populate("profile")
          .select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.json({
        success: true,
        user:
          buildUserResponse(
            user
          ),
      });
    } catch (err) {
      console.error(
        "Fetch profile error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);

// --------------------------------------------------
// UPDATE PROFILE / QUESTIONNAIRE
// --------------------------------------------------

router.put(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        age,
        height,
        weight,
        gender,
        dietaryPreferences,
        allergies,
        healthGoals,
        lifestyle,
        calorieGoalOverride,
      } = req.body;

      // -----------------------------
      // NUMERIC VALIDATION
      // -----------------------------

      if (
        age !== undefined &&
        age !== null &&
        age !== ""
      ) {
        const parsedAge =
          Number(age);

        if (
          !Number.isFinite(
            parsedAge
          ) ||
          parsedAge <= 0 ||
          parsedAge > MAX_AGE
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Age must be between 1 and 120",
          });
        }
      }

      if (
        height !== undefined &&
        height !== null &&
        height !== ""
      ) {
        const parsedHeight =
          Number(height);

        if (
          !Number.isFinite(
            parsedHeight
          ) ||
          parsedHeight <= 0 ||
          parsedHeight > MAX_HEIGHT_CM
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Height must be between 1 and 300 cm",
          });
        }
      }

      if (
        weight !== undefined &&
        weight !== null &&
        weight !== ""
      ) {
        const parsedWeight =
          Number(weight);

        if (
          !Number.isFinite(
            parsedWeight
          ) ||
          parsedWeight <= 0 ||
          parsedWeight > MAX_WEIGHT_KG
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Weight must be between 1 and 500 kg",
          });
        }
      }

      if (
        calorieGoalOverride !==
          undefined &&
        calorieGoalOverride !==
          null &&
        calorieGoalOverride !== ""
      ) {
        const parsedGoal =
          Number(
            calorieGoalOverride
          );

        if (
          !Number.isFinite(
            parsedGoal
          ) ||
          parsedGoal <= 0 ||
          parsedGoal >
            MAX_CALORIE_GOAL
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Calorie goal must be between 1 and 5000 kcal",
          });
        }
      }

      // -----------------------------
      // GENDER
      // -----------------------------

      if (
        gender !== undefined &&
        gender !== null &&
        gender !== "" &&
        ![
          "Male",
          "Female",
          "Other",
        ].includes(gender)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid gender",
        });
      }

      // -----------------------------
      // DIETARY PREFERENCE
      // -----------------------------

      if (
        dietaryPreferences !==
          undefined &&
        dietaryPreferences !==
          null &&
        dietaryPreferences !== "" &&
        !PROFILE_ENUMS
          .DIETARY_PREFERENCES
          .includes(
            dietaryPreferences
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid dietary preference",
        });
      }

      // -----------------------------
      // ALLERGIES
      // -----------------------------

      if (
        allergies !== undefined &&
        (
          !Array.isArray(
            allergies
          ) ||
          allergies.some(
            (allergy) =>
              !PROFILE_ENUMS
                .ALLERGIES
                .includes(
                  allergy
                )
          )
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid allergies",
        });
      }

      // -----------------------------
      // HEALTH GOALS
      // -----------------------------

      if (
        healthGoals !== undefined &&
        (
          !Array.isArray(
            healthGoals
          ) ||
          healthGoals.some(
            (goal) =>
              !PROFILE_ENUMS
                .HEALTH_GOALS
                .includes(
                  goal
                )
          )
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid health goals",
        });
      }

      // -----------------------------
      // LIFESTYLE
      // -----------------------------

      if (
        lifestyle !== undefined &&
        lifestyle !== null &&
        lifestyle !== "" &&
        !PROFILE_ENUMS
          .LIFESTYLES
          .includes(
            lifestyle
          )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid lifestyle",
        });
      }

      // -----------------------------
      // UPDATE USER NAME
      // -----------------------------

      if (name !== undefined) {
        const cleanName =
          String(name).trim();

        if (!cleanName) {
          return res.status(400).json({
            success: false,
            message:
              "Name cannot be empty",
          });
        }

        await User.findByIdAndUpdate(
          req.user.id,
          {
            name: cleanName,
          }
        );
      }

      // -----------------------------
      // PROFILE UPDATE
      // -----------------------------

      let profile =
        await UserProfile.findOne({
          userId: req.user.id,
        });

      if (!profile) {
        profile =
          new UserProfile({
            userId:
              req.user.id,
          });
      }

      if (
        age !== undefined &&
        age !== ""
      ) {
        profile.age =
          Number(age);
      }

      if (
        height !== undefined &&
        height !== ""
      ) {
        profile.height =
          Number(height);
      }

      if (
        weight !== undefined &&
        weight !== ""
      ) {
        profile.weight =
          Number(weight);
      }

      if (
        gender !== undefined &&
        gender !== ""
      ) {
        profile.gender =
          gender;
      }

      if (
        dietaryPreferences !==
          undefined &&
        dietaryPreferences !== ""
      ) {
        profile.dietaryPreferences =
          dietaryPreferences;
      }

      if (
        allergies !== undefined
      ) {
        profile.allergies =
          allergies;
      }

      if (
        healthGoals !== undefined
      ) {
        profile.healthGoals =
          healthGoals;
      }

      if (
        lifestyle !== undefined &&
        lifestyle !== ""
      ) {
        profile.lifestyle =
          lifestyle;
      }

      if (
        calorieGoalOverride !==
          undefined
      ) {
        profile.calorieGoalOverride =
          calorieGoalOverride ===
            "" ||
          calorieGoalOverride ===
            null
            ? undefined
            : Number(
                calorieGoalOverride
              );
      }

      // -----------------------------
      // QUESTIONNAIRE COMPLETION
      // -----------------------------

      const hasCoreQuestionnaireData =
        profile.age &&
        profile.height &&
        profile.weight &&
        profile.gender &&
        profile.dietaryPreferences &&
        Array.isArray(
          profile.healthGoals
        ) &&
        profile.healthGoals.length >
          0 &&
        profile.lifestyle;

      profile.questionnaireCompleted =
        Boolean(
          hasCoreQuestionnaireData
        );

      await profile.save();

      // -----------------------------
      // RETURN UPDATED USER
      // -----------------------------

      const updatedUser =
        await User.findById(
          req.user.id
        )
          .populate("profile")
          .select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Profile updated successfully",
        user:
          buildUserResponse(
            updatedUser
          ),
        profile:
          updatedUser.profile,
      });
    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);

export default router;