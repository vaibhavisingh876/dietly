import express from "express";
import mongoose from "mongoose";

import Meal from "../models/Meal.js";
import UserProfile from "../models/Userprofile.js";

import { analyzeMeal } from "../utils/groqClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getLocalDateString,
  resolveTimezone,
} from "../utils/dateUtils.js";

import {
  findOrCreateEntry,
  recalcTotalCalories,
} from "../utils/mealHelpers.js";

const router = express.Router();

router.use(authMiddleware);

const ALLOWED_MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

const MEAL_TYPE_TO_ENTRY_BUCKET = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Snack: "eveningSnack",
};

const DEFAULT_CALORIE_GOAL = 2000;

const MAX_ANALYSIS_TEXT_LENGTH = 1000;
const MAX_MEAL_NAME_LENGTH = 150;
const MAX_MEAL_TEXT_LENGTH = 1000;
const MAX_SUMMARY_LENGTH = 1000;
const MAX_INGREDIENTS = 50;
const MAX_FEEDBACK_ITEMS = 20;
const MAX_FEEDBACK_TEXT_LENGTH = 500;
const MAX_RECIPE_LENGTH = 3000;

/* -------------------- Helpers -------------------- */

function toNonNegativeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function getMealName(text) {
  const cleanText = text.trim();

  if (cleanText.length <= 80) {
    return cleanText;
  }

  return `${cleanText.slice(0, 77)}...`;
}

function sanitizeFeedback(feedback) {
  if (!Array.isArray(feedback)) {
    return [];
  }

  return feedback
    .filter(
      (item) =>
        item &&
        typeof item.text === "string" &&
        item.text.trim()
    )
    .slice(0, MAX_FEEDBACK_ITEMS)
    .map((item) => ({
      type: ["positive", "warning", "neutral"].includes(
        item.type
      )
        ? item.type
        : "neutral",

      text: item.text
        .trim()
        .slice(0, MAX_FEEDBACK_TEXT_LENGTH),
    }));
}

function sanitizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_INGREDIENTS);
}

function getMealType(value) {
  return ALLOWED_MEAL_TYPES.includes(value)
    ? value
    : "Lunch";
}

async function resolveDailyGoal(userId) {
  const profile = await UserProfile.findOne({
    userId,
  }).lean();

  const goal =
    profile?.calorieGoalOverride ||
    profile?.calorieGoal ||
    DEFAULT_CALORIE_GOAL;

  return Number.isFinite(Number(goal)) && Number(goal) > 0
    ? Number(goal)
    : DEFAULT_CALORIE_GOAL;
}

async function addMealCaloriesToEntry({
  userId,
  date,
  mealType,
  calories,
  dailyGoal,
}) {
  const bucket =
    MEAL_TYPE_TO_ENTRY_BUCKET[mealType];

  if (!bucket) {
    throw new Error("Invalid meal type.");
  }

  const entry = await findOrCreateEntry(
    userId,
    date,
    dailyGoal
  );

  entry.meals[bucket] =
    (entry.meals[bucket] || 0) + calories;

  recalcTotalCalories(entry);

  await entry.save();

  return entry;
}

/* -------------------- AI Meal Analysis -------------------- */

router.post("/analyze", async (req, res) => {
  try {
    const { text, mealType } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Meal description is required.",
      });
    }

    const cleanText = text.trim();

    if (
      cleanText.length >
      MAX_ANALYSIS_TEXT_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        error:
          `Meal description must be ${MAX_ANALYSIS_TEXT_LENGTH} characters or less.`,
      });
    }

    const selectedMealType =
      getMealType(mealType);

    /* ---------- AI ---------- */

    let aiResult;

    try {
      aiResult = await analyzeMeal(cleanText);
    } catch (error) {
      console.error(
        "Groq meal analysis error:",
        error?.message || error
      );

      return res.status(503).json({
        success: false,
        error:
          "AI service is temporarily unavailable. Please try again later.",
      });
    }

    /* ---------- Validate AI response ---------- */

    if (
      !aiResult ||
      typeof aiResult !== "object" ||
      typeof aiResult.summary !== "string"
    ) {
      console.error(
        "Invalid AI meal result:",
        aiResult
      );

      return res.status(502).json({
        success: false,
        error:
          "AI returned an invalid nutrition report. Please try again.",
      });
    }

    const macros = {
      calories: toNonNegativeNumber(
        aiResult.calories
      ),

      protein: toNonNegativeNumber(
        aiResult.protein
      ),

      carbs: toNonNegativeNumber(
        aiResult.carbs
      ),

      fat: toNonNegativeNumber(
        aiResult.fat
      ),

      fiber: toNonNegativeNumber(
        aiResult.fiber
      ),
    };

    const feedback = sanitizeFeedback(
      aiResult.feedback
    );

    const macroList = [
      {
        name: "Calories",
        value: macros.calories,
        unit: "kcal",
      },
      {
        name: "Protein",
        value: macros.protein,
        unit: "g",
      },
      {
        name: "Carbs",
        value: macros.carbs,
        unit: "g",
      },
      {
        name: "Fat",
        value: macros.fat,
        unit: "g",
      },
      {
        name: "Fiber",
        value: macros.fiber,
        unit: "g",
      },
    ];

    /* ---------- Date / Goal ---------- */

    const timezone = resolveTimezone(req);

    const date =
      getLocalDateString(timezone);

    const dailyGoal =
      await resolveDailyGoal(req.user.id);

    /* ---------- Save Meal ---------- */

    const meal = await Meal.create({
      userId: req.user.id,

      name: getMealName(cleanText),

      mealText: cleanText,

      date,

      mealType: selectedMealType,

      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,

      summary: aiResult.summary
        .trim()
        .slice(0, MAX_SUMMARY_LENGTH),

      feedback,

      aiGenerated: true,
    });

    /*
     * IMPORTANT:
     * Keep Meal and MealEntry synchronized.
     *
     * Meal is used for history/macros.
     * MealEntry is used by the Progress dashboard
     * for daily calorie totals and trends.
     */

    try {
      await addMealCaloriesToEntry({
        userId: req.user.id,
        date,
        mealType: selectedMealType,
        calories: macros.calories,
        dailyGoal,
      });
    } catch (entryError) {
      /*
       * Do not leave a Meal behind if its calorie
       * tracking entry could not be updated.
       */
      try {
        await Meal.deleteOne({
          _id: meal._id,
          userId: req.user.id,
        });
      } catch (cleanupError) {
        console.error(
          "Meal cleanup failed:",
          cleanupError
        );
      }

      throw entryError;
    }

    return res.status(201).json({
      success: true,

      data: {
        summary: meal.summary,

        macros: macroList,

        feedback,

        mealId: meal._id,

        date: meal.date,

        /*
         * Direct numeric fields are also returned
         * so frontend consumers do not have to depend
         * exclusively on the macros array.
         */
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        fiber: macros.fiber,
      },
    });
  } catch (error) {
    console.error(
      "Error analyzing meal:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to analyze meal.",
    });
  }
});

/* -------------------- Add Manual / AI Meal -------------------- */

router.post("/add", async (req, res) => {
  try {
    const {
      mealName,
      ingredients,
      calories,
      mealType,
      protein,
      carbs,
      fat,
      fiber,
      summary,
      feedback,
      mealText,
      recipe,
      aiGenerated,
    } = req.body;

    if (
      typeof mealName !== "string" ||
      !mealName.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Meal name is required.",
      });
    }

    const cleanMealName =
      mealName.trim();

    if (
      cleanMealName.length >
      MAX_MEAL_NAME_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        error:
          `Meal name must be ${MAX_MEAL_NAME_LENGTH} characters or less.`,
      });
    }

    if (
      mealText !== undefined &&
      typeof mealText !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Meal description must be text.",
      });
    }

    if (
      typeof mealText === "string" &&
      mealText.trim().length >
        MAX_MEAL_TEXT_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        error:
          `Meal description must be ${MAX_MEAL_TEXT_LENGTH} characters or less.`,
      });
    }

    const selectedMealType =
      getMealType(mealType);

    const timezone =
      resolveTimezone(req);

    const date =
      getLocalDateString(timezone);

    const dailyGoal =
      await resolveDailyGoal(req.user.id);

    const safeIngredients =
      sanitizeIngredients(ingredients);

    const safeFeedback =
      sanitizeFeedback(feedback);

    const safeSummary =
      typeof summary === "string"
        ? summary
            .trim()
            .slice(
              0,
              MAX_SUMMARY_LENGTH
            )
        : undefined;

    const safeMealText =
      typeof mealText === "string"
        ? mealText
            .trim()
            .slice(
              0,
              MAX_MEAL_TEXT_LENGTH
            )
        : undefined;

    const safeRecipe =
      typeof recipe === "string"
        ? recipe
            .trim()
            .slice(
              0,
              MAX_RECIPE_LENGTH
            )
        : undefined;

    const safeCalories =
      toNonNegativeNumber(calories);

    const meal =
      await Meal.create({
        userId: req.user.id,

        name: cleanMealName,

        ingredients:
          safeIngredients,

        calories:
          safeCalories,

        protein:
          toNonNegativeNumber(protein),

        carbs:
          toNonNegativeNumber(carbs),

        fat:
          toNonNegativeNumber(fat),

        fiber:
          toNonNegativeNumber(fiber),

        summary:
          safeSummary,

        feedback:
          safeFeedback,

        mealText:
          safeMealText,

        recipe:
          safeRecipe,

        mealType:
          selectedMealType,

        date,

        aiGenerated:
          Boolean(aiGenerated),
      });

    /*
     * Keep manually added meals synchronized
     * with MealEntry as well.
     */
    try {
      await addMealCaloriesToEntry({
        userId: req.user.id,
        date,
        mealType: selectedMealType,
        calories: safeCalories,
        dailyGoal,
      });
    } catch (entryError) {
      try {
        await Meal.deleteOne({
          _id: meal._id,
          userId: req.user.id,
        });
      } catch (cleanupError) {
        console.error(
          "Meal cleanup failed:",
          cleanupError
        );
      }

      throw entryError;
    }

    return res.status(201).json({
      success: true,
      meal,
    });
  } catch (error) {
    console.error(
      "Error adding meal:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to save meal.",
    });
  }
});

/* -------------------- Meal History -------------------- */

router.get("/history", async (req, res) => {
  try {
    const meals =
      await Meal.find({
        userId: req.user.id,
      })
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(100)
        .lean();

    return res.json({
      success: true,
      meals,
    });
  } catch (error) {
    console.error(
      "Meal history error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Failed to load meal history.",
    });
  }
});

/* -------------------- Single Meal -------------------- */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid meal ID.",
      });
    }

    const meal =
      await Meal.findOne({
        _id: id,
        userId: req.user.id,
      }).lean();

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: "Meal not found.",
      });
    }

    return res.json({
      success: true,
      meal,
    });
  } catch (error) {
    console.error(
      "Meal detail error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to load meal.",
    });
  }
});

export default router;