import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
console.log("Using GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY missing in .env");
}

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// ======= Queue + Cache =======
const requestQueue = [];
let isProcessingQueue = false;
const cache = new Map(); // simple in-memory cache
const PROMPT_RETRY_LIMIT = 2; // max retries per prompt

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;
    isProcessingQueue = true;

    while (requestQueue.length > 0) {
        const { prompt, resolve, reject, retryCount } = requestQueue.shift();
        
        // 🔥 Cache Check: Yahan dekho ki API call zaroori hai ya nahi
        if (cache.has(prompt)) {
            console.log("🟢 CACHE HIT (Gemini Client): Serving request from internal cache.");
            resolve(cache.get(prompt));
            await new Promise(r => setTimeout(r, 100)); // small delay for clean console
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
                    // retry after delay
                    requestQueue.push({ prompt, resolve, reject, retryCount: retryCount + 1 });
                } else {
                    reject(new Error(data.error?.message || "Failed to fetch from Gemini API"));
                }
                await new Promise(r => setTimeout(r, 5000)); // wait 5 sec before next
                continue;
            }

            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            let jsonResult = {};
            try {
                const jsonStart = rawText.indexOf("{");
                const jsonEnd = rawText.lastIndexOf("}") + 1;
                jsonResult = JSON.parse(rawText.slice(jsonStart, jsonEnd));
            } catch (e) {
                console.warn("Failed to parse JSON, returning empty object");
            }

            cache.set(prompt, jsonResult);
            resolve(jsonResult);

            await new Promise(r => setTimeout(r, 6000)); // 6 sec gap between requests
        } catch (err) {
            console.error("Gemini Analyze Error:", err);
            reject(err);
            await new Promise(r => setTimeout(r, 5000)); // wait before next
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

    return enqueueRequest(prompt);
};

export const getRecipeSuggestion = async (ingredients) => {
    const prompt = `Suggest 3 recipes using these ingredients: ${ingredients.join(", ")}.`;
    return enqueueRequest(prompt);
};