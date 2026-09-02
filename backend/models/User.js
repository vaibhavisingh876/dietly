import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    country: {
      type: String, // Required by auth.js register route
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);