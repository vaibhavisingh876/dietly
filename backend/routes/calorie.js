import express from "express";
import Calorie from "../models/Calorie.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper: today's date
const today = () => new Date().toISOString().split("T")[0];

// Helper: AI se calories nikalna
const getCaloriesFromAI = async (mealText) => {
  const prompt = `Analyze the following meal: "${mealText}". Return ONLY the estimated total calorie count as a single number. Do not include any text, units, or explanations.`;
  try {
    const result = await model.generateContent(prompt);
    // Remove any non-digit characters and parse the integer
    const text = result.response.text.replace(/[^\d]/g, '');
    return parseInt(text) || 0;
  } catch (e) {
    console.error("AI Calorie Analysis Failed:", e);
    return 0;
  }
};

// Get today's entry (ab goal bhi dega)
router.get("/today", async (req, res) => {
  try {
    const entry = await Calorie.findOne({ date: today() });
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Naya Endpoint: Daily Goal Set Karna
router.post("/set-goal", async (req, res) => {
  const { goal } = req.body;

  try {
    let entry = await Calorie.findOne({ date: today() });

    if (!entry) {
      entry = new Calorie({ date: today(), dailyGoal: goal });
    } else {
      entry.dailyGoal = goal;
    }
    await entry.save();

    res.json({ message: "Daily goal updated", entry });
  } catch (err) {
    res.status(500).json({ error: "Error updating daily goal" });
  }
});


// Naya Endpoint: Meal Text se Calories jodna
router.post("/add-meal-text", async (req, res) => {
  const { mealType, mealText } = req.body;

  try {
    const calories = await getCaloriesFromAI(mealText);

    let entry = await Calorie.findOne({ date: today() });

    if (!entry) {
      entry = new Calorie({ date: today() });
    }

    // Purane calories se naye calories ko replace karein ya add karein
    entry.meals[mealType] = calories; 
    await entry.save();

    res.json({ message: "Meal updated and calories estimated by AI", calories, entry });
  } catch (err) {
    res.status(500).json({ error: "Error processing meal text" });
  }
});


// Naya Endpoint: Over-intake par AI Tips aur Next Day Plan
router.post("/ai-over-intake-plan", async (req, res) => {
  const { totalCalories, dailyGoal } = req.body;
  const surplus = totalCalories - dailyGoal;

  const prompt = `
    User has consumed ${totalCalories} kcal against a daily goal of ${dailyGoal} kcal, resulting in a surplus of ${surplus} kcal.
    
    1. Give a short, encouraging tip (max 2 lines) to help them burn the surplus calories today (e.g., exercise ideas).
    2. Give a simple, sample diet plan for the next day (max 3 short meals/snack ideas) to help them get back on track.
    
    Format the response as JSON:
    {
      "tip": "...",
      "nextDayPlan": [
        {"meal": "Breakfast", "food": "..."},
        {"meal": "Lunch", "food": "..."},
        {"meal": "Snack", "food": "..."}
      ]
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            tip: { type: "STRING" },
            nextDayPlan: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  meal: { type: "STRING" },
                  food: { type: "STRING" }
                }
              }
            }
          },
        }
      }
    });

    const jsonText = result.response.text.trim();
    // Safety check: attempt to parse the JSON response
    const aiResponse = JSON.parse(jsonText); 
    res.json(aiResponse);

  } catch (e) {
    console.error("AI Over-Intake Plan Failed:", e);
    // Fallback response in case of AI or JSON parsing error
    res.status(200).json({ 
      tip: `You consumed ${surplus} kcal extra. Go for a brisk 30-minute walk to burn some calories!`,
      nextDayPlan: [
        { "meal": "Breakfast", "food": "Oats with berries (200 kcal)" },
        { "meal": "Lunch", "food": "Large salad with grilled chicken (350 kcal)" },
        { "meal": "Dinner", "food": "Steamed vegetables and lentils (300 kcal)" }
      ]
    });
  }
});


// Old water intake route (unchanged)
router.post("/add-water", async (req, res) => {
  const { amount } = req.body;

  try {
    let entry = await Calorie.findOne({ date: today() });

    if (!entry) {
      entry = new Calorie({ date: today() });
    }

    entry.waterIntake = amount;
    await entry.save();

    res.json({ message: "Water updated", entry });
  } catch (err) {
    res.status(500).json({ error: "Error updating water" });
  }
});

export default router;