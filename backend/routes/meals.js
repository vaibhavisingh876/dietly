// routes/meals.js
import express from "express";
import mongoose from "mongoose";
import Meal from "../models/Meal.js";
import UserProfile from "../models/UserProfile.js";
import { analyzeMeal } from "../utils/groqClient.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { resolveTimezone, getLocalDateString } from "../utils/dateUtils.js";
import { buildAllergyWarnings } from "../utils/allergyFilter.js";

const router = express.Router();

// Protect all routes in this file — meal data and AI analysis are
// user-specific, so nothing here is reachable without a valid JWT.
router.use(authMiddleware);

// =====================================================
// POST /api/meals/analyze
//
// The single, authenticated entry point for AI meal analysis. Consolidates
// what used to be two separate implementations (the unauthenticated
// /api/ai/analyze and this route). Flow:
//   authenticate -> load profile -> personalized AI call -> validate ->
//   deterministic allergy safety check -> persist Meal -> respond
// =====================================================
router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: false, error: "Meal description is required." });
    }

    const profile = await UserProfile.findOne({ userId: req.user.id }).lean();

    let aiResult;
    try {
      aiResult = await analyzeMeal(text.trim(), profile);
    } catch (e) {
      console.error("Groq analyze error:", e.message);
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable. Please try again later.",
      });
    }

    // Deterministic backend safety layer: never rely solely on the AI to
    // catch allergy conflicts. Merge in any conflicts it may have missed.
    const extraWarnings = buildAllergyWarnings(text, aiResult.summary, profile?.allergies || []);
    const existingWarningTexts = new Set(
      aiResult.feedback.filter((f) => f.type === "warning").map((f) => f.text)
    );
    const feedback = [
      ...aiResult.feedback,
      ...extraWarnings.filter((w) => !existingWarningTexts.has(w.text)),
    ];

    const tz = resolveTimezone(req);
    const date = getLocalDateString(tz);

    const meal = new Meal({
      userId: req.user.id,
      name: text.trim().slice(0, 80),
      mealText: text.trim(),
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
      fiber: aiResult.fiber,
      summary: aiResult.summary,
      feedback,
      aiGenerated: true,
      date,
    });
    await meal.save();

    res.json({
      success: true,
      data: {
        mealId: meal._id,
        summary: aiResult.summary,
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        fiber: aiResult.fiber,
        feedback,
        date,
      },
    });
  } catch (error) {
    console.error("Error analyzing meal:", error.message);
    res.status(500).json({ success: false, error: "Failed to analyze meal. Backend error or invalid response." });
  }
});

// =====================================================
// POST /api/meals/add — manual meal entry (no AI involved).
// aiGenerated is always false here — it is only ever set true where a
// meal was actually produced by the AI (see /analyze above and
// routes/calorie.js's add-meal-text).
// =====================================================
router.post("/add", async (req, res) => {
  try {
    const { mealName, ingredients, calories, protein, carbs, fat, fiber, mealType } = req.body;
    const userId = req.user.id;

    if (!mealName || !String(mealName).trim()) {
      return res.status(400).json({ error: "Meal name is required." });
    }

    const tz = resolveTimezone(req);
    const date = getLocalDateString(tz);

    const meal = new Meal({
      userId,
      name: String(mealName).trim(),
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      mealType: mealType || "Lunch",
      aiGenerated: false,
      date,
    });

    await meal.save();
    res.status(201).json({ success: true, meal });
  } catch (error) {
    console.error("Error adding meal:", error.message);
    res.status(500).json({ error: "Failed to add meal" });
  }
});

// =====================================================
// GET /api/meals/history — recent meals for the authenticated user,
// newest first. Backs the Meal History page.
// =====================================================
router.get("/history", async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
    const meals = await Meal.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, meals });
  } catch (error) {
    console.error("Error fetching meal history:", error.message);
    res.status(500).json({ success: false, error: "Failed to load meal history" });
  }
});

// =====================================================
// GET /api/meals/:id — a single meal's detail. Ownership is enforced via
// the userId filter, not by trusting anything from the client.
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid meal id" });
    }

    const meal = await Meal.findOne({ _id: id, userId: req.user.id }).lean();
    if (!meal) {
      return res.status(404).json({ success: false, error: "Meal not found" });
    }

    res.json({ success: true, meal });
  } catch (error) {
    console.error("Error fetching meal:", error.message);
    res.status(500).json({ success: false, error: "Failed to load meal" });
  }
});

export default router;