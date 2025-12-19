import express from "express";
import Calorie from "../models/Calorie.js";
import { analyzeMeal } from "../utils/geminiClient.js";

const router = express.Router();

const today = () => new Date().toISOString().split("T")[0];

// --- AI PARSER ---
const getCaloriesFromAI = async (mealText) => {
  try {
    const analysis = await analyzeMeal(mealText);
    const calObj = analysis.macros?.find(
      (m) => m.name?.toLowerCase() === "calories"
    );
    const calories = calObj ? parseInt(calObj.value.replace(/[^\d]/g, "")) : 0;
    return calories || 0;
  } catch (err) {
    console.error("AI calorie extraction failed:", err);
    return 0;
  }
};

// --- GET TODAY ---
router.get("/today", async (req, res) => {
  try {
    let entry = await Calorie.findOne({ date: today() });
    if (!entry)
      entry = await Calorie.create({
        date: today(),
        meals: { breakfast: 0, lunch: 0, dinner: 0, eveningSnack: 0 },
      });

    res.json({ entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- SET MEAL CALORIES ---
router.post("/set-meal-calories", async (req, res) => {
  const { mealType, calories } = req.body;

  console.log("Received:", req.body);

  if (!mealType)
    return res.status(400).json({ error: "mealType missing", body: req.body });

  let cal = parseInt(calories);
  if (isNaN(cal)) cal = 0;

  try {
    let entry = await Calorie.findOne({ date: today() });
    if (!entry)
      entry = await Calorie.create({
        date: today(),
        meals: { breakfast: 0, lunch: 0, dinner: 0, eveningSnack: 0 },
      });

    entry.meals[mealType] = cal;
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

  if (!mealType || !mealText)
    return res.status(400).json({ error: "Invalid input" });

  try {
    const calories = await getCaloriesFromAI(mealText);

    let entry = await Calorie.findOne({ date: today() });
    if (!entry)
      entry = await Calorie.create({
        date: today(),
        meals: { breakfast: 0, lunch: 0, dinner: 0, eveningSnack: 0 },
      });

    entry.meals[mealType] += calories;
    await entry.save();

    res.json({ calories, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Meal processing failed" });
  }
});

// --- WATER ---
router.post("/add-water", async (req, res) => {
  const { amount } = req.body;

  try {
    let entry = await Calorie.findOne({ date: today() });
    if (!entry) entry = new Calorie({ date: today() });

    entry.waterIntake = Math.max(0, parseInt(amount) || 0);
    await entry.save();

    res.json({ message: "Water updated", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Water update failed" });
  }
});

export default router;
