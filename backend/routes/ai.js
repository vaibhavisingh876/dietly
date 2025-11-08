import express from "express";
import { getRecipeSuggestion } from "../utils/geminiClient.js";

const router = express.Router();

router.post("/suggest", async (req, res) => {
  try {
    const { ingredients } = req.body;
    const recipes = await getRecipeSuggestion(ingredients);
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
