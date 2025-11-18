import express from "express";
import Calorie from "../models/Calorie.js";
import { analyzeMeal } from "../utils/geminiClient.js";

const router = express.Router();

// Helper to get today's date
const today = () => new Date().toISOString().split("T")[0];

// 🔥 SIMPLIFIED: Ab yeh function seedhe analyzeMeal ko call karega.
// GeminiClient ke andar caching aur queueing khud ho jayegi.
const getCaloriesFromAI = async (mealText) => {
    try {
        const analysis = await analyzeMeal(mealText);
        const calObj = analysis.macros.find((m) => m.name.toLowerCase() === "calories");
        const calories = calObj ? parseInt(calObj.value.replace(/[^\d]/g, "")) : 0;
        return calories || 0;
    } catch (err) {
        console.error("AI calorie extraction failed:", err);
        return 0;
    }
};

// GET today's entry
router.get("/today", async (req, res) => {
    try {
        const entry = await Calorie.findOne({ date: today() });
        res.json({ entry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Set daily goal
router.post("/set-goal", async (req, res) => {
    const { goal } = req.body;
    try {
        let entry = await Calorie.findOne({ date: today() });
        if (!entry) entry = new Calorie({ date: today() });

        entry.dailyGoal = Math.max(1000, goal); // Minimum goal 1000
        await entry.save();

        res.json({ message: "Goal updated", entry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update goal" });
    }
});

// Add meal from text
router.post("/add-meal-text", async (req, res) => {
    const { mealType, mealText } = req.body;

    try {
        // 🔥 Change: Simplified call
        const calories = await getCaloriesFromAI(mealText); 

        let entry = await Calorie.findOne({ date: today() });
        if (!entry) entry = new Calorie({ date: today() });

        entry.meals[mealType] = (entry.meals[mealType] || 0) + calories;

        await entry.save();

        res.json({ calories, entry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Meal processing failed" });
    }
});

// Update water intake
router.post("/add-water", async (req, res) => {
    const { amount } = req.body;

    try {
        let entry = await Calorie.findOne({ date: today() });
        if (!entry) entry = new Calorie({ date: today() });

        entry.waterIntake = Math.max(0, amount);
        await entry.save();

        res.json({ message: "Water updated", entry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Water update failed" });
    }
});

export default router;