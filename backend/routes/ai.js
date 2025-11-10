import express from "express";
import { analyzeMeal, getRecipeSuggestion } from "../utils/geminiClient.js";

const router = express.Router();

/**
 * POST /api/ai/analyze
 * Analyze meal text and return structured nutrition data
 */
router.post("/analyze", async (req, res) => {
  try {
    const { mealText } = req.body;

    if (!mealText || typeof mealText !== "string" || !mealText.trim()) {
      return res.status(400).json({ success: false, error: "mealText is required" });
    }

    const result = await analyzeMeal(mealText);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Gemini Analyze Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to analyze meal",
      details: err.message,
    });
  }
});

/**
 * POST /api/ai/suggest
 * Suggest recipes using provided ingredients
 */
router.post("/suggest", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "ingredients must be a non-empty array",
      });
    }

    console.log("Ingredients received for suggestion:", ingredients);

    let recipes = await getRecipeSuggestion(ingredients);
    console.log("Recipes returned by Gemini:", recipes);

    // Fallback: if no recipes returned, create dummy suggestions
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      recipes = [
        {
          name: "Quick Veggie Stir-Fry",
          difficulty: "Easy",
          cookTime: "15 mins",
          ingredients,
          recipe: `Heat oil in a pan, add all ingredients, stir-fry for 10 minutes, season with salt & spices, and serve hot.`
        },
        {
          name: "Simple Mixed Salad",
          difficulty: "Easy",
          cookTime: "5 mins",
          ingredients,
          recipe: `Chop all ingredients, mix in a bowl, add dressing of your choice, and enjoy fresh.`
        }
      ];
      console.log("Using fallback recipes:", recipes);
    }

    res.json({ success: true, recipes });
  } catch (err) {
    console.error("Gemini Recipe Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to get recipe suggestions",
      details: err.message,
    });
  }
});

export default router;
