import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
    // 💡 Add reference to the UserProfile model
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);