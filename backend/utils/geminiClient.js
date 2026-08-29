
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

console.log("✅ Groq API initialized");

if (!process.env.GROQ_API_KEY) {
    throw new Error("❌ GROQ_API_KEY missing in .env");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";

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

        // ===== CACHE =====
        if (cache.has(prompt)) {
            console.log(
                "🟢 CACHE HIT (Groq Client): Serving request from internal cache."
            );

            resolve(cache.get(prompt));

            await new Promise((r) => setTimeout(r, 100));
            continue;
        }

        console.log(
            "🔴 CACHE MISS (Groq Client): Calling external Groq API..."
        );

        try {
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,

                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],

                    // Force JSON response
                    response_format: {
                        type: "json_object",
                    },

                    temperature: 0.2,
                }),
            });

            const data = await response.json();

            // ===== API ERROR =====
            if (!response.ok) {
                console.error("❌ Groq API Error:", data);

                if (retryCount < PROMPT_RETRY_LIMIT) {
                    console.log(
                        `🔄 Retrying Groq request... (${retryCount + 1}/${PROMPT_RETRY_LIMIT})`
                    );

                    requestQueue.push({
                        prompt,
                        resolve,
                        reject,
                        retryCount: retryCount + 1,
                    });
                } else {
                    reject(
                        new Error(
                            data.error?.message ||
                                "Failed to fetch from Groq API"
                        )
                    );
                }

                await new Promise((r) => setTimeout(r, 5000));
                continue;
            }

            // ===== EXTRACT RESPONSE =====
            const rawText =
                data?.choices?.[0]?.message?.content || "{}";

            let jsonResult = {};

            try {
                jsonResult = JSON.parse(rawText);
            } catch (e) {
                console.error(
                    "❌ Invalid JSON from Groq:",
                    e.message
                );

                // Retry if Groq returned invalid JSON
                if (retryCount < PROMPT_RETRY_LIMIT) {
                    console.log(
                        `🔄 Retrying because response was not valid JSON...`
                    );

                    requestQueue.push({
                        prompt,
                        resolve,
                        reject,
                        retryCount: retryCount + 1,
                    });

                    await new Promise((r) => setTimeout(r, 3000));
                    continue;
                }

                reject(e);
                continue;
            }

            // ===== CACHE RESULT =====
            cache.set(prompt, jsonResult);

            resolve(jsonResult);

            // Small delay between requests
            await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
            console.error("❌ Groq API Error:", err);

            if (retryCount < PROMPT_RETRY_LIMIT) {
                requestQueue.push({
                    prompt,
                    resolve,
                    reject,
                    retryCount: retryCount + 1,
                });

                await new Promise((r) => setTimeout(r, 3000));
            } else {
                reject(err);
            }
        }
    }

    isProcessingQueue = false;
};

// ======= Queue Request =======
const enqueueRequest = (prompt) => {
    return new Promise((resolve, reject) => {
        requestQueue.push({
            prompt,
            resolve,
            reject,
            retryCount: 0,
        });

        processQueue();
    });
};

// =====================================================
// ANALYZE MEAL
// =====================================================

export const analyzeMeal = async (mealText) => {
    const prompt = `
Analyze this meal: "${mealText}".

Return ONLY a JSON object exactly in this format:

{
  "summary": "Short summary of the meal",
  "macros": [
    {
      "name": "Calories",
      "value": "420 kcal"
    },
    {
      "name": "Protein",
      "value": "32g"
    },
    {
      "name": "Carbs",
      "value": "48g"
    },
    {
      "name": "Fiber",
      "value": "15g"
    }
  ],
  "feedback": [
    {
      "text": "Great protein source",
      "type": "positive"
    },
    {
      "text": "Consider drinking more water",
      "type": "neutral"
    }
  ]
}
`;

    const result = await enqueueRequest(prompt);

    // ===== VALIDATION =====
    if (
        !result.summary ||
        !Array.isArray(result.macros) ||
        !Array.isArray(result.feedback)
    ) {
        throw new Error("Invalid Groq response for analyzeMeal");
    }

    return result;
};

// =====================================================
// RECIPE SUGGESTION
// =====================================================

export const getRecipeSuggestion = async (ingredients) => {
    const prompt = `
Suggest exactly 3 recipes using these ingredients:

${ingredients.join(", ")}

Guidelines:
- Prioritize using the provided ingredients as much as possible.
- You may assume common pantry staples such as salt, oil, spices and water.
- Avoid expensive or uncommon ingredients.
- Each recipe must have:
  - name
  - difficulty (Easy/Medium/Hard)
  - estimated cook time
  - list of main ingredients actually used
  - brief cooking instructions

Return ONLY valid JSON in this exact format:

{
  "recipes": [
    {
      "name": "Recipe name",
      "difficulty": "Easy",
      "cookTime": "20 mins",
      "ingredients": [
        "ingredient1",
        "ingredient2"
      ],
      "recipe": "Step-by-step instructions in a few sentences."
    }
  ]
}
`;

    const result = await enqueueRequest(prompt);

    // ===== VALIDATION =====
    if (
        !result.recipes ||
        !Array.isArray(result.recipes) ||
        result.recipes.length === 0
    ) {
        throw new Error(
            "Invalid Groq response for getRecipeSuggestion"
        );
    }

    return result;
};

// =====================================================
// PANTRY ROUTE WRAPPER
// =====================================================

export const generateRecipesFromIngredients = async (ingredients) => {
    const result = await getRecipeSuggestion(ingredients);

    return result.recipes || [];
};

