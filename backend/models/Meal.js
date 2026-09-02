// models/Meal.js
//
// A single logged meal — either AI-analyzed (from the Analyze page / the
// Calories page's "AI Add") or manually entered. This is the source of
// truth for Meal History and for the macro/meals-tracked analytics on the
// Progress dashboard.

import mongoose from "mongoose";

const feedbackItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String, default: "neutral" }, // "positive" | "warning" | "neutral"
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true, // e.g. "Paneer Tikka" or "Oatmeal Smoothie"
    },
    // Raw text the user typed in, when this meal came from AI analysis.
    mealText: {
      type: String,
    },
    ingredients: {
      type: [String], // e.g. ["Paneer", "Yogurt", "Spices"]
      default: [],
    },
    recipe: {
      type: String, // short description or instructions
    },

    // ---- Structured nutrition (numbers, not "420 kcal" style strings) ----
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 }, // grams
    carbs: { type: Number, default: 0 }, // grams
    fat: { type: Number, default: 0 }, // grams
    fiber: { type: Number, default: 0 }, // grams

    // Short AI summary + structured feedback (personalized to the user's
    // profile when available). Empty for purely manual entries.
    summary: { type: String },
    feedback: { type: [feedbackItemSchema], default: [] },

    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      default: "Lunch",
    },

    // true only when this meal was actually produced by the AI (analysis
    // or AI-assisted calorie add) — never hardcoded for manual entries.
    aiGenerated: {
      type: Boolean,
      default: false,
    },

    // Local calendar date (YYYY-MM-DD) this meal counts toward, resolved
    // via the user's timezone (see utils/dateUtils.js). Used for Meal
    // History grouping, streaks, and the Progress dashboard's date-range
    // queries.
    date: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

mealSchema.index({ userId: 1, date: -1 });
mealSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Meal", mealSchema);