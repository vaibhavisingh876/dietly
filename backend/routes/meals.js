// routes/meals.js
import express from "express";
import Meal from "../models/Meal.js";
import { analyzeMeal } from "../utils/geminiClient.js";

const router = express.Router();

// 🧠 AI Meal Analysis
router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Meal description is required." });
    }

    const aiResult = await analyzeMeal(text);

    // Validate AI result
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

    // Standardized response for frontend
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
    const { userId, mealName, ingredients, calories, mealType } = req.body;

    if (!userId || !mealName) {
      return res.status(400).json({ error: "User ID and meal name required." });
    }

    const meal = new Meal({
      userId,
      name: mealName, // Make sure field name matches schema
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
