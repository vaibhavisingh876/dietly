import express from "express";

import Meal from "../models/Meal.js";
import UserProfile from "../models/UserProfile.js";

import { analyzeMeal } from "../utils/groqClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  resolveTimezone,
  getLocalDateString,
} from "../utils/dateUtils.js";

import {
  findOrCreateEntry,
  recalcTotalCalories,
} from "../utils/mealHelpers.js";

import {
  buildAllergyWarnings,
} from "../utils/allergyFilter.js";

const router = express.Router();

router.use(authMiddleware);

const ALLOWED_MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "eveningSnack",
];

const MEAL_TYPE_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  eveningSnack: "Snack",
};

const DEFAULT_CALORIE_GOAL = 2000;
const MAX_MEAL_TEXT_LENGTH = 1000;
const MAX_WATER = 20000;

/* -------------------- Helpers -------------------- */

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

function isValidMealType(mealType) {
  return ALLOWED_MEAL_TYPES.includes(mealType);
}

function getSafeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

async function getNutritionFromAI(mealText, profile) {
  const analysis = await analyzeMeal(
    mealText,
    profile
  );

  if (
    !analysis ||
    typeof analysis !== "object" ||
    typeof analysis.calories !== "number" ||
    analysis.calories < 0
  ) {
    throw new Error("Invalid calorie value from AI");
  }

  return {
    calories: getSafeNumber(analysis.calories),
    protein: getSafeNumber(analysis.protein),
    carbs: getSafeNumber(analysis.carbs),
    fat: getSafeNumber(analysis.fat),
    fiber: getSafeNumber(analysis.fiber),
    summary:
      typeof analysis.summary === "string"
        ? analysis.summary.trim()
        : "",
    feedback: Array.isArray(analysis.feedback)
      ? analysis.feedback
      : [],
  };
}

/* -------------------- GET TODAY -------------------- */

router.get("/today", async (req, res) => {
  try {
    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const dailyGoal = await resolveDailyGoal(
      req.user.id
    );

    const entry = await findOrCreateEntry(
      req.user.id,
      date,
      dailyGoal
    );

    return res.json({
      entry,
    });
  } catch (error) {
    console.error("Get today's calories error:", error);

    return res.status(500).json({
      error: "Unable to load today's calorie data.",
    });
  }
});

/* -------------------- SET MEAL CALORIES -------------------- */

router.post("/set-meal-calories", async (req, res) => {
  const { mealType, calories } = req.body;

  if (!isValidMealType(mealType)) {
    return res.status(400).json({
      error: "Invalid meal type.",
    });
  }

  if (
    calories === undefined ||
    calories === null ||
    String(calories).trim() === ""
  ) {
    return res.status(400).json({
      error: "Calories are required.",
    });
  }

  const parsedCalories = Number(calories);

  if (
    !Number.isFinite(parsedCalories) ||
    parsedCalories < 0
  ) {
    return res.status(400).json({
      error: "Calories must be a non-negative number.",
    });
  }

  try {
    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const dailyGoal = await resolveDailyGoal(
      req.user.id
    );

    const entry = await findOrCreateEntry(
      req.user.id,
      date,
      dailyGoal
    );

    entry.meals[mealType] = parsedCalories;

    recalcTotalCalories(entry);

    await entry.save();

    return res.json({
      message: "Calories updated successfully.",
      entry,
    });
  } catch (error) {
    console.error("Set meal calories error:", error);

    return res.status(500).json({
      error: "Failed to update meal calories.",
    });
  }
});

/* -------------------- ADD MEAL USING AI -------------------- */

router.post("/add-meal-text", async (req, res) => {
  const { mealType, mealText } = req.body;

  if (!isValidMealType(mealType)) {
    return res.status(400).json({
      error: "Invalid meal type.",
    });
  }

  if (
    typeof mealText !== "string" ||
    !mealText.trim()
  ) {
    return res.status(400).json({
      error: "Meal description is required.",
    });
  }

  const cleanMealText = mealText.trim();

  if (cleanMealText.length > MAX_MEAL_TEXT_LENGTH) {
    return res.status(400).json({
      error:
        `Meal description must be ${MAX_MEAL_TEXT_LENGTH} characters or less.`,
    });
  }

  try {
    const profile = await UserProfile.findOne({
      userId: req.user.id,
    }).lean();

    let nutrition;

    try {
      nutrition = await getNutritionFromAI(
        cleanMealText,
        profile
      );
    } catch (error) {
      console.error(
        "AI meal processing error:",
        error?.message || error
      );

      return res.status(503).json({
        error:
          "AI meal analysis is temporarily unavailable. Please try again later.",
      });
    }

    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const dailyGoal = await resolveDailyGoal(
      req.user.id
    );

    /*
     * Create the Meal first.
     *
     * If this fails, we don't touch today's calorie entry.
     * This avoids the old situation where calories could be
     * added successfully but Meal History could fail.
     */
    const allergyWarnings = buildAllergyWarnings(
      cleanMealText,
      nutrition.summary,
      profile?.allergies || []
    );

    const aiFeedback = nutrition.feedback
      .filter(
        (item) =>
          item &&
          typeof item.text === "string" &&
          item.text.trim()
      )
      .map((item) => ({
        type: item.type || "neutral",
        text: item.text.trim(),
      }));

    const existingWarningTexts = new Set(
      aiFeedback
        .filter((item) => item.type === "warning")
        .map((item) => item.text)
    );

    const feedback = [
      ...aiFeedback,
      ...allergyWarnings.filter(
        (warning) =>
          !existingWarningTexts.has(warning.text)
      ),
    ];

    const meal = await Meal.create({
      userId: req.user.id,

      name: cleanMealText.slice(0, 80),

      mealText: cleanMealText,

      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,

      summary: nutrition.summary,

      feedback,

      mealType: MEAL_TYPE_LABELS[mealType],

      aiGenerated: true,

      date,
    });

    try {
      const entry = await findOrCreateEntry(
        req.user.id,
        date,
        dailyGoal
      );

      entry.meals[mealType] =
        (entry.meals[mealType] || 0) +
        nutrition.calories;

      recalcTotalCalories(entry);

      await entry.save();

      return res.status(201).json({
        calories: nutrition.calories,
        entry,
        mealId: meal._id,
      });
    } catch (entryError) {
      /*
       * The Meal was created but calorie entry failed.
       * Remove the Meal so the two systems don't drift apart.
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
  } catch (error) {
    console.error(
      "Add AI meal error:",
      error
    );

    return res.status(500).json({
      error:
        "Meal could not be added. Please try again.",
    });
  }
});

/* -------------------- SET WATER -------------------- */

router.post("/set-water", async (req, res) => {
  const { amount } = req.body;

  if (
    amount === undefined ||
    amount === null ||
    String(amount).trim() === ""
  ) {
    return res.status(400).json({
      error: "Water amount is required.",
    });
  }

  const parsedAmount = Number(amount);

  if (
    !Number.isFinite(parsedAmount) ||
    parsedAmount < 0 ||
    parsedAmount > MAX_WATER
  ) {
    return res.status(400).json({
      error:
        `Water intake must be between 0 and ${MAX_WATER} ml.`,
    });
  }

  try {
    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const dailyGoal = await resolveDailyGoal(
      req.user.id
    );

    const entry = await findOrCreateEntry(
      req.user.id,
      date,
      dailyGoal
    );

    entry.waterIntake = parsedAmount;

    await entry.save();

    return res.json({
      message: "Water intake updated successfully.",
      entry,
    });
  } catch (error) {
    console.error("Set water error:", error);

    return res.status(500).json({
      error: "Failed to update water intake.",
    });
  }
});

export default router;