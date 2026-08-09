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
        console.error("Gemini Analyze Error:", e.message);

        return res.status(503).json({
          success: false,
          error: "AI service temporarily unavailable. Please try again later.",
        });
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
  console.error("Gemini Suggest Error:", e.message);

  return res.status(503).json({
    success: false,
    error: "Recipe suggestion service is temporarily unavailable.",
  });
}

    res.json({ success: true, recipes });
  } catch (err) {
    console.error("AI Suggest Error:", err);
    res.status(500).json({ success: false, error: "Failed to get recipe suggestions", details: err.message });
  }
});

export default router;
