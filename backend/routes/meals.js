import express from "express";

import Meal from "../models/Meal.js";
import { analyzeMeal } from "../utils/groqClient.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getLocalDateString,
  resolveTimezone,
} from "../utils/dateUtils.js";

const router = express.Router();

router.use(authMiddleware);

/* -------------------- Helpers -------------------- */

function toNonNegativeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function extractMacro(macros, name) {
  if (!Array.isArray(macros)) {
    return 0;
  }

  const macro = macros.find(
    (item) =>
      typeof item?.name === "string" &&
      item.name.trim().toLowerCase() === name.toLowerCase()
  );

  return toNonNegativeNumber(macro?.value);
}

function getMealName(text) {
  const cleanText = text.trim();

  if (cleanText.length <= 80) {
    return cleanText;
  }

  return `${cleanText.slice(0, 77)}...`;
}

/* -------------------- AI Meal Analysis -------------------- */

router.post("/analyze", async (req, res) => {
  try {
    const { text, mealType } = req.body;

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Meal description is required.",
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Meal description is too long.",
      });
    }

    const allowedMealTypes = [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
    ];

    const selectedMealType = allowedMealTypes.includes(mealType)
      ? mealType
      : "Lunch";

    let aiResult;

    try {
      aiResult = await analyzeMeal(text.trim());
    } catch (error) {
      console.error("Groq meal analysis error:", error.message);

      return res.status(503).json({
        success: false,
        error:
          "AI service is temporarily unavailable. Please try again later.",
      });
    }

    if (
      !aiResult ||
      typeof aiResult !== "object" ||
      typeof aiResult.summary !== "string" ||
      !Array.isArray(aiResult.macros)
    ) {
      console.error("Invalid AI result:", aiResult);

      return res.status(502).json({
        success: false,
        error: "AI returned an invalid nutrition report. Please try again.",
      });
    }

    const macros = {
      calories: extractMacro(aiResult.macros, "Calories"),
      protein: extractMacro(aiResult.macros, "Protein"),
      carbs: extractMacro(aiResult.macros, "Carbs"),
      fat: extractMacro(aiResult.macros, "Fat"),
      fiber: extractMacro(aiResult.macros, "Fiber"),
    };

    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const meal = await Meal.create({
      userId: req.user.id,
      name: getMealName(text),
      mealText: text.trim(),
      date,
      mealType: selectedMealType,

      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,

      feedback: Array.isArray(aiResult.feedback)
        ? aiResult.feedback
            .filter(
              (item) =>
                item &&
                typeof item.text === "string"
            )
            .map((item) => ({
              type: ["positive", "warning", "neutral"].includes(item.type)
                ? item.type
                : "neutral",
              text: item.text.trim(),
            }))
        : [],

      aiGenerated: true,
    });

    return res.status(201).json({
      success: true,
      data: {
        summary: aiResult.summary,
        macros: aiResult.macros,
        feedback: aiResult.feedback || [],
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

    const allowedMealTypes = [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
    ];

    const selectedMealType = allowedMealTypes.includes(mealType)
      ? mealType
      : "Lunch";

    const timezone = resolveTimezone(req);
    const date = getLocalDateString(timezone);

    const safeIngredients = Array.isArray(ingredients)
      ? ingredients
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 50)
      : [];

    const meal = await Meal.create({
      userId: req.user.id,

      name: mealName.trim().slice(0, 150),

      ingredients: safeIngredients,

      calories: toNonNegativeNumber(calories),
      protein: toNonNegativeNumber(protein),
      carbs: toNonNegativeNumber(carbs),
      fat: toNonNegativeNumber(fat),
      fiber: toNonNegativeNumber(fiber),

      summary:
        typeof summary === "string"
          ? summary.trim().slice(0, 1000)
          : undefined,

      feedback: Array.isArray(feedback)
        ? feedback
            .filter((item) => item && typeof item.text === "string")
            .map((item) => ({
              type: ["positive", "warning", "neutral"].includes(item.type)
                ? item.type
                : "neutral",
              text: item.text.trim(),
            }))
        : [],

      mealText:
        typeof mealText === "string"
          ? mealText.trim().slice(0, 1000)
          : undefined,

      mealType: selectedMealType,
      date,
      aiGenerated: true,
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
    const meal = await Meal.findOne({
      _id: req.params.id,
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