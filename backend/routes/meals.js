// routes/meals.js
import express from "express";
import Meal from "../models/Meal.js";
import { analyzeMeal } from "../utils/groqClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes in this file
router.use(authMiddleware);

// 🧠 AI Meal Analysis
router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Meal description is required." });
    }

    const aiResult = await analyzeMeal(text);

    if (
      !aiResult ||
      !aiResult.summary ||
      !aiResult.macros ||
      !aiResult.feedback
    ) {
      console.error("Invalid AI result:", aiResult);
      return res
        .status(500)
        .json({ error: "AI returned invalid response. Try again." });
    }

    const response = {
      success: true,
      data: {
        summary: aiResult.summary,
        macros: aiResult.macros,
        feedback: aiResult.feedback,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error analyzing meal:", error.message);
    res
      .status(500)
      .json({ error: "Failed to analyze meal. Backend error or invalid response." });
  }
});

// Add new meal
router.post("/add", async (req, res) => {
  try {
    const { mealName, ingredients, calories, mealType } = req.body;
    const userId = req.user.id;

    if (!mealName) {
      return res.status(400).json({ error: "Meal name is required." });
    }

    const meal = new Meal({
      userId,
      name: mealName,
      ingredients: ingredients || [],
      calories: calories || 0,
      mealType: mealType || "Lunch",
      aiGenerated: true,
    });

    await meal.save();
    res.status(201).json({ success: true, meal });
  } catch (error) {
    console.error("Error adding meal:", error.message);
    res.status(500).json({ error: "Failed to add meal" });
  }
});

export default router;