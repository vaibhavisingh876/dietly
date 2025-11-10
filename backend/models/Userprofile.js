// models/UserProfile.js

import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Faster queries when fetching by user
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Please enter a valid age"],
    },
    height: {
      type: Number, // in cm
      min: [0, "Height cannot be negative"],
    },
    weight: {
      type: Number, // in kg
      min: [0, "Weight cannot be negative"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dietaryPreferences: {
      type: [String], // e.g. ["Vegetarian", "Vegan", "Dairy-Free"]
      default: [],
    },
    healthGoals: {
      type: String, // e.g. "Weight Loss", "Muscle Gain", "Maintenance"
      trim: true,
    },
    allergies: {
      type: [String], // e.g. ["Peanuts", "Gluten"]
      default: [],
    },
  },
  { timestamps: true }
);

// Optional: automatically delete profile when user is deleted
// userProfileSchema.pre("remove", async function (next) {
//   await mongoose.model("User").updateOne(
//     { _id: this.userId },
//     { $unset: { profile: "" } }
//   );
//   next();
// });

export default mongoose.model("UserProfile", userProfileSchema);
