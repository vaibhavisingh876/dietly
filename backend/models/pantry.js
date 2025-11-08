import mongoose from "mongoose";

const pantrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fridge: [String],
  kitchen: [String],
});

export default mongoose.model("Pantry", pantrySchema);
