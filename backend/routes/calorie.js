import express from "express";
import MealEntry from "../models/MealEntry.js";
import { analyzeMeal } from "../utils/geminiClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Helper: today's date as YYYY-MM-DD string
const todayString = () => new Date().toISOString().split("T")[0];

// Helper: find or create today's entry for the authenticated user
const findOrCreateTodayEntry = async (userId) => {
  const today = todayString();
  let entry = await MealEntry.findOne({ userId, date: today });
  if (!entry) {
    entry = await MealEntry.create({
      userId,
      date: today,
      dailyGoal: 2000,
      meals: { breakfast: 0, lunch: 0, dinner: 0, eveningSnack: 0 },
      totalCalories: 0,
      waterIntake: 0,
    });
  }
  return entry;
};

// --- AI PARSER (throws on failure, no silent 0) ---
const getCaloriesFromAI = async (mealText) => {
  const analysis = await analyzeMeal(mealText);
  const calObj = analysis.macros?.find(
    (m) => m.name?.toLowerCase() === "calories"
  );
  if (!calObj) {
    throw new Error("AI response missing calories");
  }
  const calories = parseInt(calObj.value.replace(/[^\d]/g, ""));
  if (isNaN(calories) || calories < 0) {
    throw new Error("Invalid calorie value from AI");
  }
  return calories;
};

// --- GET TODAY ---
router.get("/today", async (req, res) => {
  try {
    const entry = await findOrCreateTodayEntry(req.user.id);
    res.json({ entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- SET MEAL CALORIES ---
router.post("/set-meal-calories", async (req, res) => {
  const { mealType, calories } = req.body;

  const allowedMeals = ["breakfast", "lunch", "dinner", "eveningSnack"];
  if (!mealType || !allowedMeals.includes(mealType)) {
    return res.status(400).json({ error: "Invalid mealType" });
  }

  const cal = parseInt(calories);
  if (isNaN(cal) || cal < 0) {
    return res.status(400).json({ error: "Calories must be a non-negative number" });
  }

  try {
    const entry = await findOrCreateTodayEntry(req.user.id);
    entry.meals[mealType] = cal;

    // Recalculate totalCalories
    const mealValues = Object.values(entry.meals);
    entry.totalCalories = mealValues.reduce((sum, val) => sum + val, 0);

    await entry.save();

    res.json({ message: "Updated", entry });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update meals" });
  }
});

// --- ADD MEAL USING AI TEXT ---
router.post("/add-meal-text", async (req, res) => {
  const { mealType, mealText } = req.body;

  const allowedMeals = ["breakfast", "lunch", "dinner", "eveningSnack"];
  if (!mealType || !allowedMeals.includes(mealType) || !mealText) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const calories = await getCaloriesFromAI(mealText);
    const entry = await findOrCreateTodayEntry(req.user.id);

    entry.meals[mealType] += calories;

    // Recalculate totalCalories
    const mealValues = Object.values(entry.meals);
    entry.totalCalories = mealValues.reduce((sum, val) => sum + val, 0);

    await entry.save();

    res.json({ calories, entry });
  } catch (err) {
    console.error("Meal processing error:", err);
    // Send a clear error when AI extraction fails
    if (err.message?.includes("AI") || err.message?.includes("calorie")) {
      return res.status(500).json({ error: "Failed to analyze meal. Please try again later." });
    }
    res.status(500).json({ error: "Meal processing failed" });
  }
});

// --- WATER ---
router.post("/add-water", async (req, res) => {
  const { amount } = req.body;

  try {
    const entry = await findOrCreateTodayEntry(req.user.id);
    entry.waterIntake = Math.max(0, parseInt(amount) || 0);
    await entry.save();

    res.json({ message: "Water updated", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Water update failed" });
  }
});

export default router;