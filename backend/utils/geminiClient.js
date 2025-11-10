// utils/geminiClient.js
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY missing in .env");
}

// Correct REST API endpoint from available models
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";


/**
 * Analyze meal using Gemini (REST API)
 */
export const analyzeMeal = async (mealText) => {
  const prompt = `
Analyze this meal: "${mealText}".
Return only a JSON object exactly in this format:
{
  "summary": "Short summary of the meal",
  "macros": [
    {"name": "Calories", "value": "420 kcal"},
    {"name": "Protein", "value": "32g"},
    {"name": "Carbs", "value": "48g"},
    {"name": "Fiber", "value": "15g"}
  ],
  "feedback": [
    {"text": "Great protein source", "type": "positive"},
    {"text": "Consider drinking more water", "type": "neutral"}
  ]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini API Error:", data);
      throw new Error(data.error?.message || "Failed to fetch from Gemini API");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}") + 1;
    const jsonString = rawText.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Analyze Error:", error);
    throw new Error("Failed to generate meal analysis from Gemini");
  }
};

/**
 * Get recipe suggestions
 */
export const getRecipeSuggestion = async (ingredients) => {
  const prompt = `Suggest 3 recipes using these ingredients: ${ingredients.join(", ")}.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini API Error:", data);
      throw new Error(data.error?.message || "Failed to fetch from Gemini API");
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No recipe suggestions found.";
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    throw new Error("Failed to generate recipe suggestion from Gemini");
  }
};
