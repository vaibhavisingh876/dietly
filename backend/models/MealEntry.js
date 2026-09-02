import mongoose from "mongoose";

const mealEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * YYYY-MM-DD in the user's resolved timezone.
     */
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    dailyGoal: {
      type: Number,
      min: 0,
      default: 2000,
    },

    meals: {
      breakfast: {
        type: Number,
        min: 0,
        default: 0,
      },

      lunch: {
        type: Number,
        min: 0,
        default: 0,
      },

      dinner: {
        type: Number,
        min: 0,
        default: 0,
      },

      eveningSnack: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    totalCalories: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
     * Water is stored in millilitres.
     */
    waterIntake: {
      type: Number,
      min: 0,
      max: 20000,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

/*
 * One calorie entry per user per local calendar day.
 */
mealEntrySchema.index(
  {
    userId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

/*
 * Useful for progress/history queries.
 */
mealEntrySchema.index({
  userId: 1,
  date: -1,
});

export default mongoose.model(
  "MealEntry",
  mealEntrySchema
);