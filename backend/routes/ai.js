import express from "express";
import { analyzeMeal, getRecipeSuggestion } from "../utils/geminiClient.js";

const router = express.Router();

// POST /api/ai/analyze
router.post("/analyze", async (req, res) => {
  try {
    const { mealText } = req.body;

    if (!mealText || typeof mealText !== "string" || !mealText.trim()) {
      return res.status(400).json({ success: false, error: "mealText is required" });
    }

    let result;
    try {
      result = await analyzeMeal(mealText); // Gemini API call
    } catch (e) {
      console.warn("Gemini failed, using fallback:", e.message);
      result = {
        summary: "Test meal summary",
        macros: [
          { name: "Calories", value: "500 kcal" },
          { name: "Protein", value: "30g" },
          { name: "Carbs", value: "50g" },
          { name: "Fiber", value: "10g" },
        ],
        feedback: [
          { text: "Good protein intake", type: "positive" },
        ],
      };
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("AI Analyze Error:", err);
    res.status(500).json({ success: false, error: "Failed to analyze meal", details: err.message });
  }
});

// POST /api/ai/suggest
router.post("/suggest", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ success: false, error: "ingredients must be a non-empty array" });
    }

    let recipes;
    try {
      recipes = await getRecipeSuggestion(ingredients);
    } catch (e) {
      console.warn("Gemini suggest failed, using fallback:", e.message);
      recipes = [
        {
          name: "Quick Veggie Stir-Fry",
          difficulty: "Easy",
          cookTime: "15 mins",
          ingredients,
          recipe: "Heat oil in a pan, add all ingredients, stir-fry for 10 minutes, season with salt & spices.",
        },
        {
          name: "Simple Mixed Salad",
          difficulty: "Easy",
          cookTime: "5 mins",
          ingredients,
          recipe: "Chop all ingredients, mix in a bowl, add dressing, serve fresh.",
        },
      ];
    }

    res.json({ success: true, recipes });
  } catch (err) {
    console.error("AI Suggest Error:", err);
    res.status(500).json({ success: false, error: "Failed to get recipe suggestions", details: err.message });
  }
});

export default router;
