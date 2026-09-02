import express from "express";
import Meal from "../models/Meal.js";
import UserProfile from "../models/UserProfile.js";
import { analyzeMeal } from "../utils/groqClient.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { resolveTimezone, getLocalDateString } from "../utils/dateUtils.js";
import { findOrCreateEntry, recalcTotalCalories } from "../utils/mealHelpers.js";
import { buildAllergyWarnings } from "../utils/allergyFilter.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

const ALLOWED_MEAL_TYPES = ["breakfast", "lunch", "dinner", "eveningSnack"];

// Maps the four calorie-bucket keys used here to the Meal model's
// mealType enum, so meals logged from this page also show up correctly
// in Meal History / Progress.
const MEAL_TYPE_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  eveningSnack: "Snack",
};

const DEFAULT_CALORIE_GOAL = 2000;

/**
 * Resolves the calorie goal to use for a brand-new MealEntry: the user's
 * override, then their computed profile goal, and only a hardcoded 2000
 * when neither is available (e.g. onboarding not completed yet).
 */
async function resolveDailyGoal(userId) {
  const profile = await UserProfile.findOne({ userId }).lean();
  return profile?.calorieGoalOverride || profile?.calorieGoal || DEFAULT_CALORIE_GOAL;
}

// --- AI PARSER (throws on failure, no silent 0) ---
const getNutritionFromAI = async (mealText, profile) => {
  const analysis = await analyzeMeal(mealText, profile);
  if (typeof analysis.calories !== "number" || analysis.calories < 0) {
    throw new Error("Invalid calorie value from AI");
  }
  return analysis;
};

// --- GET TODAY ---
router.get("/today", async (req, res) => {
  try {
    const tz = resolveTimezone(req);
    const date = getLocalDateString(tz);
    const dailyGoalFallback = await resolveDailyGoal(req.user.id);
    const entry = await findOrCreateEntry(req.user.id, date, dailyGoalFallback);
    res.json({ entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- SET MEAL CALORIES (manual, replaces the bucket's value) ---
router.post("/set-meal-calories", async (req, res) => {
  const { mealType, calories } = req.body;

  if (!mealType || !ALLOWED_MEAL_TYPES.includes(mealType)) {
    return res.status(400).json({ error: "Invalid mealType" });
  }

  const cal = parseInt(calories);
  if (isNaN(cal) || cal < 0) {
    return res.status(400).json({ error: "Calories must be a non-negative number" });
  }

  try {
    const tz = resolveTimezone(req);
    const date = getLocalDateString(tz);
    const dailyGoalFallback = await resolveDailyGoal(req.user.id);
    const entry = await findOrCreateEntry(req.user.id, date, dailyGoalFallback);

    entry.meals[mealType] = cal;
    recalcTotalCalories(entry);
    await entry.save();

    res.json({ message: "Updated", entry });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update meals" });
  }
});

// --- ADD MEAL USING AI TEXT (personalized, also logs to Meal history) ---
router.post("/add-meal-text", async (req, res) => {
  const { mealType, mealText } = req.body;

  if (!mealType || !ALLOWED_MEAL_TYPES.includes(mealType) || !mealText) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const profile = await UserProfile.findOne({ userId: req.user.id }).lean();

    let nutrition;
    try {
      nutrition = await getNutritionFromAI(mealText, profile);
    } catch (e) {
      console.error("Meal processing error:", e.message);
      return res.status(500).json({ error: "Failed to analyze meal. Please try again later." });
    }

    const tz = resolveTimezone(req);
    const date = getLocalDateString(tz);
    const dailyGoalFallback = await resolveDailyGoal(req.user.id);

    const entry = await findOrCreateEntry(req.user.id, date, dailyGoalFallback);
    entry.meals[mealType] = (entry.meals[mealType] || 0) + nutrition.calories;
    recalcTotalCalories(entry);
    await entry.save();

    // Also persist as a Meal so it shows up in Meal History / Progress —
    // this is genuinely AI-generated, so aiGenerated is correctly true.
    const extraWarnings = buildAllergyWarnings(mealText, nutrition.summary, profile?.allergies || []);
    const existingWarningTexts = new Set(
      nutrition.feedback.filter((f) => f.type === "warning").map((f) => f.text)
    );
    const feedback = [
      ...nutrition.feedback,
      ...extraWarnings.filter((w) => !existingWarningTexts.has(w.text)),
    ];

    await Meal.create({
      userId: req.user.id,
      name: mealText.trim().slice(0, 80),
      mealText: mealText.trim(),
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

    res.json({ calories: nutrition.calories, entry });
  } catch (err) {
    console.error("Meal processing error:", err);
    res.status(500).json({ error: "Meal processing failed" });
  }
});

// --- WATER: explicitly SETS today's total water intake (not additive).
// The frontend labels this as "enter the total you want to record" —
// this endpoint name and behavior are kept consistent with that.
router.post("/set-water", async (req, res) => {
  const { amount } = req.body;

  try {
    const tz = resolveTimezone(req);
    const date = getLocalDateString(tz);
    const dailyGoalFallback = await resolveDailyGoal(req.user.id);
    const entry = await findOrCreateEntry(req.user.id, date, dailyGoalFallback);

    entry.waterIntake = Math.max(0, parseInt(amount) || 0);
    await entry.save();

    res.json({ message: "Water updated", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Water update failed" });
  }
});

export default router;