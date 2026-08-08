import mongoose from "mongoose";

const mealEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },                 // YYYY-MM-DD
  dailyGoal: { type: Number, default: 2000 },
  meals: {
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 },
    eveningSnack: { type: Number, default: 0 },
  },
  totalCalories: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 }, // in ml
});

// Ensure one entry per user per day
mealEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("MealEntry", mealEntrySchema);