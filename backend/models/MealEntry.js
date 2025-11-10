import mongoose from "mongoose";

const mealEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0) },
  meals: {
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 },
    eveningSnack: { type: Number, default: 0 },
  },
  totalCalories: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 }, // in ml
});

export default mongoose.model("MealEntry", mealEntrySchema);
