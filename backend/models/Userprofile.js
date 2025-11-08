// models/UserProfile.js

import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    age: {
      type: Number,
    },
    height: {
      type: Number, // in cm
    },
    weight: {
      type: Number, // in kg
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
    },
    allergies: {
      type: [String], // e.g. ["Peanuts", "Gluten"]
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);
