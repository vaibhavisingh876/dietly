// models/UserProfile.js
//
// UserProfile is the single source of truth for a user's health/nutrition
// context. It is populated by the onboarding Questionnaire and can be
// edited later from the Profile page. Every personalization feature
// (calorie goal, AI meal analysis, pantry recipes) reads from here.

import mongoose from "mongoose";

const DIETARY_PREFERENCES = ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"];
const ALLERGIES = ["Gluten", "Dairy", "Eggs", "Fish"];
const HEALTH_GOALS = [
  "Weight Loss",
  "More Energy",
  "Muscle Gain",
  "Balanced Diet",
  "Better Sleep",
  "Stress Relief",
];
const LIFESTYLES = ["Sedentary", "Moderate", "Active", "Very Active"];

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
      index: true,
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Please enter a valid age"],
    },
    height: {
      type: Number, // cm
      min: [0, "Height cannot be negative"],
    },
    weight: {
      type: Number, // kg
      min: [0, "Weight cannot be negative"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    // Single-select: a person follows one diet.
    dietaryPreferences: {
      type: String,
      enum: DIETARY_PREFERENCES,
    },

    // Multi-select: a person can have several allergies/intolerances.
    allergies: {
      type: [String],
      enum: ALLERGIES,
      default: [],
    },

    // Multi-select: "Select all that apply" per the questionnaire UI.
    healthGoals: {
      type: [String],
      enum: HEALTH_GOALS,
      default: [],
    },

    // Single-select: activity level used for calorie goal estimation.
    lifestyle: {
      type: String,
      enum: LIFESTYLES,
    },

    // Estimated daily calorie target (Mifflin-St Jeor + activity/goal
    // adjustment). Recalculated whenever the inputs change. Nullable until
    // enough profile data exists to compute it.
    calorieGoal: {
      type: Number,
      min: 0,
    },

    // User can override the computed calorieGoal manually.
    calorieGoalOverride: {
      type: Number,
      min: 0,
    },

    questionnaireCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Mifflin-St Jeor BMR, adjusted for activity level, then nudged toward the
 * user's stated goals. This is an ESTIMATE, not medical advice — callers
 * must always present it as such.
 */
export function estimateCalorieGoal({ age, height, weight, gender, lifestyle, healthGoals }) {
  if (!age || !height || !weight || !gender) return null;

  const bmr =
    gender === "Male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161; // Female/Other use the female constant as a neutral default

  const activityMultipliers = {
    Sedentary: 1.2,
    Moderate: 1.375,
    Active: 1.55,
    "Very Active": 1.725,
  };
  const multiplier = activityMultipliers[lifestyle] || 1.2;

  let tdee = bmr * multiplier;

  const goals = healthGoals || [];
  if (goals.includes("Weight Loss")) tdee -= 400;
  if (goals.includes("Muscle Gain")) tdee += 300;

  return Math.round(Math.max(1200, tdee)); // floor to avoid suggesting unsafe-low targets
}

userProfileSchema.pre("save", function (next) {
  if (
    this.isModified("age") ||
    this.isModified("height") ||
    this.isModified("weight") ||
    this.isModified("gender") ||
    this.isModified("lifestyle") ||
    this.isModified("healthGoals")
  ) {
    const estimated = estimateCalorieGoal(this);
    if (estimated) this.calorieGoal = estimated;
  }
  next();
});

export const PROFILE_ENUMS = { DIETARY_PREFERENCES, ALLERGIES, HEALTH_GOALS, LIFESTYLES };

export default mongoose.model("UserProfile", userProfileSchema);