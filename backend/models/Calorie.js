// OBSOLETE: This model is no longer used. All calorie/water tracking is now done via MealEntry.
// This file is kept to avoid breaking any existing imports that may still reference it.

import mongoose from "mongoose";

const calorieSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  meals: {
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 },
    eveningSnack: { type: Number, default: 0 },
  },
  totalCalories: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 },
});

export default mongoose.model("Calorie", calorieSchema);