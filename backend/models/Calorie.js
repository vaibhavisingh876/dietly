import mongoose from "mongoose";

const calorieSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  // Naya field: user ka daily calorie goal
  dailyGoal: { type: Number, default: 2000 }, 
  meals: {
    breakfast: { type: Number, default: 0 },
    lunch: { type: Number, default: 0 },
    dinner: { type: Number, default: 0 },
    eveningSnack: { type: Number, default: 0 },
  },
  waterIntake: { type: Number, default: 0 },
});

export default mongoose.model("Calorie", calorieSchema, "calories");