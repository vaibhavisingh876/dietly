import express from "express";
import mongoose from "mongoose";

import Meal from "../models/Meal.js";
import UserProfile from "../models/UserProfile.js";
import { analyzeMeal } from "../utils/groqClient.js";
import { buildAllergyWarnings } from "../utils/allergyFilter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getLocalDateString,
  resolveTimezone,
} from "../utils/dateUtils.js";

const router = express.Router();

router.use(authMiddleware);

const ALLOWED_MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

const MAX_ANALYSIS_TEXT_LENGTH = 1000;
const MAX_MEAL_NAME_LENGTH = 150;
const MAX_MEAL_TEXT_LENGTH = 1000;
const MAX_SUMMARY_LENGTH = 1000;
const MAX_RECIPE_LENGTH = 3000;
const MAX_INGREDIENTS = 50;
const MAX_FEEDBACK_ITEMS = 20;
const MAX_FEEDBACK_TEXT_LENGTH = 500;
const MAX_CALORIES = 10000;

/* -------------------- Helpers -------------------- */

function toNonNegativeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function clampNumber(value, max = Infinity) {
  return Math.min(toNonNegativeNumber(value), max);
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
      type: ["positive", "warning", "neutral"].includes(item.type)
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

function buildMacros(aiResult) {
  return [
    {
      name: "Calories",
      value: clampNumber(aiResult?.calories, MAX_CALORIES),
      unit: "kcal",
    },
    {
      name: "Protein",
      value: toNonNegativeNumber(aiResult?.protein),
      unit: "g",
    },
    {
      name: "Carbs",
      value: toNonNegativeNumber(aiResult?.carbs),
      unit: "g",
    },
    {
      name: "Fat",
      value: toNonNegativeNumber(aiResult?.fat),
      unit: "g",
    },
    {
      name: "Fiber",
      value: toNonNegativeNumber(aiResult?.fiber),
      unit: "g",
    },
  ];
}

function mergeFeedback(baseFeedback, allergyWarnings) {
  const combined = [
    ...(Array.isArray(baseFeedback) ? baseFeedback : []),
    ...(Array.isArray(allergyWarnings) ? allergyWarnings : []),
  ];

  const seen = new Set();

  return combined
    .filter((item) => {
      if (
        !item ||
        typeof item.text !== "string" ||
        !item.text.trim()
      ) {
        return false;
      }

      const key = item.text.trim().toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, MAX_FEEDBACK_ITEMS)
    .map((item) => ({
      type: ["positive", "warning", "neutral"].includes(item.type)
        ? item.type
        : "neutral",
      text: item.text
        .trim()
        .slice(0, MAX_FEEDBACK_TEXT_LENGTH),
    }));
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

    if (cleanText.length > MAX_ANALYSIS_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error:
          `Meal description must be ${MAX_ANALYSIS_TEXT_LENGTH} characters or less.`,
      });
    }

    const selectedMealType = getMealType(mealType);

    /* ---------- Load user profile ---------- */

    const profile = await UserProfile.findOne({
      userId: req.user.id,
    }).lean();

    /* ---------- AI ---------- */

    let aiResult;

    try {
      aiResult = await analyzeMeal(
        cleanText,
        profile || null
      );
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
      console.error("Invalid AI meal result:", aiResult);

      return res.status(502).json({
        success: false,
        error:
          "AI returned an invalid nutrition report. Please try again.",
      });
    }

    const macros = buildMacros(aiResult);

    const aiFeedback = sanitizeFeedback(aiResult.feedback);

    /* ---------- Allergy warnings ---------- */

    let allergyWarnings = [];

    try {
      allergyWarnings = buildAllergyWarnings(
        cleanText,
        aiResult.summary,
        profile?.allergies || []
      );
    } catch (error) {
      console.error(
        "Allergy warning generation error:",
        error?.message || error
      );
    }

    const feedback = mergeFeedback(
      aiFeedback,
      allergyWarnings
    );

    /* ---------- Save ---------- */

    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const meal = await Meal.create({
      userId: req.user.id,

      name: getMealName(cleanText),

      mealText: cleanText,

      date,

      mealType: selectedMealType,

      calories: macros[0].value,
      protein: macros[1].value,
      carbs: macros[2].value,
      fat: macros[3].value,
      fiber: macros[4].value,

      summary: aiResult.summary
        .trim()
        .slice(0, MAX_SUMMARY_LENGTH),

      feedback,

      aiGenerated: true,
    });

    return res.status(201).json({
      success: true,

      data: {
        summary: meal.summary,

        macros,

        feedback,

        mealId: meal._id,

        date: meal.date,
      },
    });
  } catch (error) {
    console.error("Error analyzing meal:", error);

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

    const cleanMealName = mealName.trim();

    if (cleanMealName.length > MAX_MEAL_NAME_LENGTH) {
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
      mealText.trim().length > MAX_MEAL_TEXT_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        error:
          `Meal description must be ${MAX_MEAL_TEXT_LENGTH} characters or less.`,
      });
    }

    const selectedMealType = getMealType(mealType);

    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const safeIngredients =
      sanitizeIngredients(ingredients);

    const safeFeedback =
      sanitizeFeedback(feedback);

    const safeSummary =
      typeof summary === "string"
        ? summary.trim().slice(0, MAX_SUMMARY_LENGTH)
        : undefined;

    const safeMealText =
      typeof mealText === "string"
        ? mealText.trim().slice(0, MAX_MEAL_TEXT_LENGTH)
        : undefined;

    const safeRecipe =
      typeof recipe === "string"
        ? recipe.trim().slice(0, MAX_RECIPE_LENGTH)
        : undefined;

    const meal = await Meal.create({
      userId: req.user.id,

      name: cleanMealName,

      ingredients: safeIngredients,

      calories: clampNumber(calories, MAX_CALORIES),
      protein: toNonNegativeNumber(protein),
      carbs: toNonNegativeNumber(carbs),
      fat: toNonNegativeNumber(fat),
      fiber: toNonNegativeNumber(fiber),

      summary: safeSummary,

      feedback: safeFeedback,

      mealText: safeMealText,

      recipe: safeRecipe,

      mealType: selectedMealType,

      date,

      aiGenerated: Boolean(aiGenerated),
    });

    return res.status(201).json({
      success: true,
      meal,
    });
  } catch (error) {
    console.error("Error adding meal:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to save meal.",
    });
  }
});

/* -------------------- Meal History -------------------- */

router.get("/history", async (req, res) => {
  try {
    const meals = await Meal.find({
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
    console.error("Meal history error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load meal history.",
    });
  }
});

/* -------------------- Single Meal -------------------- */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid meal ID.",
      });
    }

    const meal = await Meal.findOne({
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
    console.error("Meal detail error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load meal.",
    });
  }
});

export default router;