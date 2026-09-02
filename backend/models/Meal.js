import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["positive", "warning", "neutral"],
      default: "neutral",
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    mealText: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    summary: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    ingredients: {
      type: [String],
      default: [],
      validate: {
        validator: (items) => items.length <= 50,
        message: "A meal can contain at most 50 ingredients.",
      },
    },

    recipe: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    /*
     * Stored as YYYY-MM-DD in the user's resolved timezone.
     */
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },

    calories: {
      type: Number,
      min: 0,
      default: 0,
    },

    protein: {
      type: Number,
      min: 0,
      default: 0,
    },

    carbs: {
      type: Number,
      min: 0,
      default: 0,
    },

    fat: {
      type: Number,
      min: 0,
      default: 0,
    },

    fiber: {
      type: Number,
      min: 0,
      default: 0,
    },

    feedback: {
      type: [feedbackSchema],
      default: [],
      validate: {
        validator: (items) => items.length <= 20,
        message: "A meal can contain at most 20 feedback items.",
      },
    },

    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      default: "Lunch",
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Fast meal-history queries for a specific user.
 */
mealSchema.index({
  userId: 1,
  date: -1,
});

mealSchema.index({
  userId: 1,
  createdAt: -1,
});

export default mongoose.model("Meal", mealSchema);