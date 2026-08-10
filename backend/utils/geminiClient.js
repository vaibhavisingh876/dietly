import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
console.log("✅ Gemini API initialized");
if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY missing in .env");
}

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// ======= Queue + Cache =======
const requestQueue = [];
let isProcessingQueue = false;
const cache = new Map();
const PROMPT_RETRY_LIMIT = 2;

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;
    isProcessingQueue = true;

    while (requestQueue.length > 0) {
        const { prompt, resolve, reject, retryCount } = requestQueue.shift();
        
        if (cache.has(prompt)) {
            console.log("🟢 CACHE HIT (Gemini Client): Serving request from internal cache.");
            resolve(cache.get(prompt));
            await new Promise(r => setTimeout(r, 100));
            continue;
        }

        console.log("🔴 CACHE MISS (Gemini Client): Calling external Gemini API...");

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
                if (retryCount < PROMPT_RETRY_LIMIT) {
                    requestQueue.push({ prompt, resolve, reject, retryCount: retryCount + 1 });
                } else {
                    reject(new Error(data.error?.message || "Failed to fetch from Gemini API"));
                }
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            let jsonResult = {};
            try {
                // Try to extract JSON from the response (it may have extra text)
                const jsonStart = rawText.indexOf("{");
                const jsonEnd = rawText.lastIndexOf("}") + 1;
                jsonResult = JSON.parse(rawText.slice(jsonStart, jsonEnd));
                // ✅ REMOVED hardcoded validation — now each function validates its own format
            } catch (e) {
                console.error("Invalid JSON from Gemini:", e.message);
                reject(e);
                continue;
            }

            cache.set(prompt, jsonResult);
            resolve(jsonResult);

            await new Promise(r => setTimeout(r, 6000));
        } catch (err) {
            console.error("Gemini API Error:", err);
            reject(err);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    isProcessingQueue = false;
};

const enqueueRequest = (prompt) => {
    return new Promise((resolve, reject) => {
        requestQueue.push({ prompt, resolve, reject, retryCount: 0 });
        processQueue();
    });
};

// ======= API functions =======
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

    const result = await enqueueRequest(prompt);
    // ✅ Validation moved here
    if (!result.summary || !Array.isArray(result.macros) || !Array.isArray(result.feedback)) {
        throw new Error("Invalid Gemini response for analyzeMeal");
    }
    return result;
};

export const getRecipeSuggestion = async (ingredients) => {
    const prompt = `
Suggest exactly 3 recipes using these ingredients:
${ingredients.join(", ")}

Guidelines:
- Prioritize using the provided ingredients as much as possible.
- You may assume common pantry staples (salt, oil, spices, water) are available, but avoid adding expensive or uncommon items.
- Each recipe must have a name, difficulty (Easy/Medium/Hard), estimated cook time, list of main ingredients (only those actually used, including some staples if necessary), and a brief cooking instruction.

Return ONLY valid JSON in this format:

{
  "recipes": [
    {
      "name": "Recipe name",
      "difficulty": "Easy",
      "cookTime": "20 mins",
      "ingredients": ["ingredient1", "ingredient2"],
      "recipe": "Step-by-step instructions in a few sentences."
    }
  ]
}
`;

    const result = await enqueueRequest(prompt);
    // ✅ Validation moved here
    if (!result.recipes || !Array.isArray(result.recipes) || result.recipes.length === 0) {
        throw new Error("Invalid Gemini response for getRecipeSuggestion");
    }
    return result;
};

// NEW: Wrapper that returns just the recipes array (for pantry route)
export const generateRecipesFromIngredients = async (ingredients) => {
    const result = await getRecipeSuggestion(ingredients);
    return result.recipes || [];
};