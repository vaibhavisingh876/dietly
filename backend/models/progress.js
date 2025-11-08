import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Progress", progressSchema);
