import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

const pantrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fridge: [itemSchema],
  kitchen: [itemSchema],
});

export default mongoose.model("Pantry", pantrySchema);
