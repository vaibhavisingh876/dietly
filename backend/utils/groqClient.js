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
// PROFILE CONTEXT (shared by meal analysis + recipes)
// =====================================================

/**
 * Turns a UserProfile document (or plain object) into a short, plain-text
 * context block the AI can use as *contextual guidance* — never as a basis
 * for medical claims. Fields that aren't set are simply omitted.
 */
function buildProfileContext(profile) {
    if (!profile) return "";

    const lines = [];
    if (profile.age) lines.push(`Age: ${profile.age}`);
    if (profile.gender) lines.push(`Gender: ${profile.gender}`);
    if (profile.height) lines.push(`Height: ${profile.height} cm`);
    if (profile.weight) lines.push(`Weight: ${profile.weight} kg`);
    if (profile.dietaryPreferences) lines.push(`Dietary preference: ${profile.dietaryPreferences}`);
    if (Array.isArray(profile.allergies) && profile.allergies.length) {
        lines.push(`Allergies/intolerances (must be flagged if present in the meal/recipe): ${profile.allergies.join(", ")}`);
    }
    if (Array.isArray(profile.healthGoals) && profile.healthGoals.length) {
        lines.push(`Health goals: ${profile.healthGoals.join(", ")}`);
    }
    if (profile.lifestyle) lines.push(`Lifestyle / activity level: ${profile.lifestyle}`);

    const goal = profile.calorieGoalOverride || profile.calorieGoal;
    if (goal) lines.push(`Estimated daily calorie goal: ~${goal} kcal`);

    if (lines.length === 0) return "";

    return `User profile (use only as contextual guidance, never as medical advice):\n${lines.join("\n")}\n\n`;
}

// =====================================================
// ANALYZE MEAL
// =====================================================

/**
 * Analyzes a meal, optionally personalized to a UserProfile.
 * `profile` is optional — when omitted, the analysis is generic.
 */
export const analyzeMeal = async (mealText, profile = null) => {
    const profileContext = buildProfileContext(profile);

    const prompt = `
${profileContext}Analyze this meal: "${mealText}".

If a user profile is provided above, use it as contextual guidance only:
- If the meal conflicts with the user's dietary preference or listed allergies, clearly say so in feedback with type "warning".
- If the meal seems notably high or low in calories relative to the user's health goals, mention it with type "warning" or "positive" as appropriate.
- Never provide medical advice or diagnoses — only general nutritional observations.

Return ONLY a JSON object exactly in this format (all nutrition fields must be plain numbers, not strings):

{
  "summary": "Short 1-2 sentence summary of the meal",
  "calories": 420,
  "protein": 32,
  "carbs": 48,
  "fat": 15,
  "fiber": 8,
  "feedback": [
    { "text": "Great protein source", "type": "positive" },
    { "text": "Contains dairy, which conflicts with your dairy allergy", "type": "warning" }
  ]
}
`;

    const result = await enqueueRequest(prompt);

    // ===== VALIDATION =====
    const numericFields = ["calories", "protein", "carbs", "fat", "fiber"];
    const coerced = { ...result };
    for (const field of numericFields) {
        const value = typeof coerced[field] === "string" ? Number(coerced[field]) : coerced[field];
        coerced[field] = value;
    }

    const isValid =
        coerced &&
        typeof coerced.summary === "string" &&
        coerced.summary.trim().length > 0 &&
        numericFields.every((f) => typeof coerced[f] === "number" && !Number.isNaN(coerced[f]) && coerced[f] >= 0) &&
        Array.isArray(coerced.feedback) &&
        coerced.feedback.every((f) => f && typeof f.text === "string" && typeof f.type === "string");

    if (!isValid) {
        console.error("Invalid Groq response for analyzeMeal:", result);
        throw new Error("Invalid Groq response for analyzeMeal");
    }

    return coerced;
};

// =====================================================
// RECIPE SUGGESTION
// =====================================================

/**
 * Suggests exactly 3 recipes from the given ingredients, optionally
 * personalized to a UserProfile (diet, allergies, health goals, lifestyle).
 */
export const getRecipeSuggestion = async (ingredients, profile = null) => {
    const profileContext = buildProfileContext(profile);

    const prompt = `
${profileContext}Suggest exactly 3 recipes using these ingredients:

${ingredients.join(", ")}

Guidelines:
- Prioritize using the provided ingredients as much as possible.
- You may assume common pantry staples such as salt, oil, spices and water.
- Avoid expensive or uncommon ingredients.
- If a user profile is provided above, the recipes MUST respect the user's dietary preference and MUST NOT intentionally include any of the user's listed allergens.
- Each recipe must have:
  - name
  - difficulty (Easy/Medium/Hard)
  - estimated cook time
  - list of main ingredients actually used
  - brief cooking instructions

Return ONLY valid JSON in this exact format, with EXACTLY 3 recipes in the array:

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
    const recipesValid =
        result &&
        Array.isArray(result.recipes) &&
        result.recipes.length === 3 &&
        result.recipes.every(
            (r) =>
                r &&
                typeof r.name === "string" && r.name.trim() &&
                typeof r.difficulty === "string" && r.difficulty.trim() &&
                typeof r.cookTime === "string" && r.cookTime.trim() &&
                Array.isArray(r.ingredients) && r.ingredients.length > 0 &&
                typeof r.recipe === "string" && r.recipe.trim()
        );

    if (!recipesValid) {
        console.error("Invalid Groq response for getRecipeSuggestion:", result);
        throw new Error(
            "Invalid Groq response for getRecipeSuggestion"
        );
    }

    return result;
};

// =====================================================
// PANTRY ROUTE WRAPPER
// =====================================================

export const generateRecipesFromIngredients = async (ingredients, profile = null) => {
    const result = await getRecipeSuggestion(ingredients, profile);

    return result.recipes || [];
};