import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY missing in environment variables");
}

const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_LIMIT = 2;
const QUEUE_DELAY_MS = 500;
const RETRY_DELAY_MS = 2_000;

const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 10 * 60 * 1000;

const requestQueue = [];
let isProcessingQueue = false;

const cache = new Map();

/* =====================================================
   CACHE
===================================================== */

function getCached(prompt) {
  const cached = cache.get(prompt);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    cache.delete(prompt);
    return null;
  }

  return cached.value;
}

function setCached(prompt, value) {
  // Remove oldest entry when cache is full.
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(prompt, {
    value,
    createdAt: Date.now(),
  });
}

/* =====================================================
   HELPERS
===================================================== */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return (
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function cleanText(value, maxLength = 500) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function toNonNegativeNumber(value) {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}

/* =====================================================
   GROQ REQUEST QUEUE
===================================================== */

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const {
      prompt,
      resolve,
      reject,
      retryCount,
    } = requestQueue.shift();

    const cached = getCached(prompt);

    if (cached) {
      resolve(cached);
      continue;
    }

    try {
      const response = await fetchWithTimeout(
        GROQ_API_URL,
        {
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

            response_format: {
              type: "json_object",
            },

            temperature: 0.2,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* ---------------------------------------------
         API ERROR
      --------------------------------------------- */

      if (!response.ok) {
        const message =
          data?.error?.message ||
          `Groq API request failed with status ${response.status}`;

        const shouldRetry =
          isRetryableStatus(response.status) &&
          retryCount < RETRY_LIMIT;

        if (shouldRetry) {
          requestQueue.push({
            prompt,
            resolve,
            reject,
            retryCount: retryCount + 1,
          });

          await sleep(RETRY_DELAY_MS);
          continue;
        }

        reject(new Error(message));
        continue;
      }

      /* ---------------------------------------------
         EXTRACT JSON
      --------------------------------------------- */

      const rawText =
        data?.choices?.[0]?.message?.content;

      if (
        typeof rawText !== "string" ||
        !rawText.trim()
      ) {
        const error =
          new Error("Groq returned an empty response.");

        if (retryCount < RETRY_LIMIT) {
          requestQueue.push({
            prompt,
            resolve,
            reject,
            retryCount: retryCount + 1,
          });

          await sleep(RETRY_DELAY_MS);
          continue;
        }

        reject(error);
        continue;
      }

      let jsonResult;

      try {
        jsonResult = JSON.parse(rawText);
      } catch {
        const error =
          new Error("Groq returned invalid JSON.");

        if (retryCount < RETRY_LIMIT) {
          requestQueue.push({
            prompt,
            resolve,
            reject,
            retryCount: retryCount + 1,
          });

          await sleep(RETRY_DELAY_MS);
          continue;
        }

        reject(error);
        continue;
      }

      setCached(prompt, jsonResult);

      resolve(jsonResult);

      await sleep(QUEUE_DELAY_MS);
    } catch (error) {
      const isTimeout =
        error?.name === "AbortError";

      const shouldRetry =
        retryCount < RETRY_LIMIT;

      if (shouldRetry) {
        requestQueue.push({
          prompt,
          resolve,
          reject,
          retryCount: retryCount + 1,
        });

        await sleep(RETRY_DELAY_MS);
        continue;
      }

      reject(
        isTimeout
          ? new Error(
              "Groq request timed out. Please try again."
            )
          : error
      );
    }
  }

  isProcessingQueue = false;
}

function enqueueRequest(prompt) {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      prompt,
      resolve,
      reject,
      retryCount: 0,
    });

    processQueue().catch((error) => {
      console.error("Groq queue error:", error);

      isProcessingQueue = false;
    });
  });
}
export function generateJsonWithGroq(prompt) {
  const safePrompt = cleanText(
    prompt,
    15_000
  );

  if (!safePrompt) {
    throw new Error(
      "AI prompt is required."
    );
  }

  return enqueueRequest(safePrompt);
}

/* =====================================================
   PROFILE CONTEXT
===================================================== */

function buildProfileContext(profile) {
  if (!profile) {
    return "";
  }

  const lines = [];

  if (profile.age) {
    lines.push(`Age: ${profile.age}`);
  }

  if (profile.gender) {
    lines.push(`Gender: ${profile.gender}`);
  }

  if (profile.height) {
    lines.push(`Height: ${profile.height} cm`);
  }

  if (profile.weight) {
    lines.push(`Weight: ${profile.weight} kg`);
  }

  if (profile.dietaryPreferences) {
    lines.push(
      `Dietary preference: ${profile.dietaryPreferences}`
    );
  }

  if (
    Array.isArray(profile.allergies) &&
    profile.allergies.length > 0
  ) {
    lines.push(
      `Allergies/intolerances: ${profile.allergies.join(
        ", "
      )}`
    );
  }

  if (
    Array.isArray(profile.healthGoals) &&
    profile.healthGoals.length > 0
  ) {
    lines.push(
      `Health goals: ${profile.healthGoals.join(", ")}`
    );
  }

  if (profile.lifestyle) {
    lines.push(
      `Lifestyle/activity level: ${profile.lifestyle}`
    );
  }

  const goal =
    profile.calorieGoalOverride ||
    profile.calorieGoal;

  if (goal) {
    lines.push(
      `Estimated daily calorie goal: ~${goal} kcal`
    );
  }

  if (lines.length === 0) {
    return "";
  }

  return (
    "User profile (contextual guidance only; never medical advice):\n" +
    `${lines.join("\n")}\n\n`
  );
}

/* =====================================================
   ANALYZE MEAL
===================================================== */

export const analyzeMeal = async (
  mealText,
  profile = null
) => {
  const safeMealText = cleanText(mealText, 1000);

  if (!safeMealText) {
    throw new Error("Meal description is required.");
  }

  const profileContext =
    buildProfileContext(profile);

  const prompt = `
${profileContext}

Analyze this meal:

"${safeMealText}"

Use the user profile only as contextual nutritional guidance.

Rules:
- Identify obvious conflicts with listed dietary preferences or allergies.
- Evaluate the WHOLE meal and every named component, not just one favourable nutrient.
- Base every observation on the foods named and the nutrition estimates you return.
- Prioritise the most decision-useful observations: overall balance, calorie density,
  fibre/produce, likely saturated fat/sodium/added sugar, caffeine, and portion size.
- Do not praise protein merely because the meal contains some protein. Only call a meal
  high/good in protein when the estimated amount is genuinely substantial relative to
  the total meal (roughly at least 20 g per 500 kcal).
- For combinations dominated by fast food, fried food, sweets, or sugary drinks, lead
  with that overall pattern and a realistic improvement; do not lead with a minor positive.
- Return 3 to 5 distinct feedback items. Include at least one neutral overall assessment
  and one actionable suggestion. Add a positive item only when it is genuinely notable.
- Each feedback item must refer to a named food/drink or a returned numeric estimate.
- Do not invent ingredients, preparation methods, portions, or health conditions.
- Never provide medical diagnoses.
- Never claim that a meal is medically safe.
- Nutrition values must be estimates.
- Return ONLY valid JSON.

Return exactly:

{
  "summary": "Short 1-2 sentence summary",
  "calories": 420,
  "protein": 32,
  "carbs": 48,
  "fat": 15,
  "fiber": 8,
  "feedback": [
    {
      "text": "The paneer contributes most of the estimated protein, while the chapatis contribute most of the carbohydrates.",
      "type": "neutral"
    },
    {
      "text": "Adding a larger serving of vegetables would improve fibre and meal variety.",
      "type": "warning"
    }
  ]
}
`;

  const result = await enqueueRequest(prompt);

  const numericFields = [
    "calories",
    "protein",
    "carbs",
    "fat",
    "fiber",
  ];

  const coerced = {
    ...result,
  };

  for (const field of numericFields) {
    coerced[field] =
      toNonNegativeNumber(coerced[field]);
  }

  const feedback = Array.isArray(
    coerced.feedback
  )
    ? coerced.feedback
        .filter(
          (item) =>
            item &&
            typeof item.text === "string"
        )
        .slice(0, 20)
        .map((item) => ({
          text: cleanText(item.text, 500),
          type: [
            "positive",
            "warning",
            "neutral",
          ].includes(item.type)
            ? item.type
            : "neutral",
        }))
        .filter((item) => item.text)
        .filter((item) => {
          const text = item.text.toLowerCase();
          const praisesProtein =
            item.type === "positive" &&
            /\b(high|good|great|excellent|rich|strong|solid)\b.{0,30}\bprotein\b|\bprotein\b.{0,30}\b(high|good|great|excellent|rich|strong|solid)\b/.test(
              text
            );

          if (!praisesProtein) {
            return true;
          }

          const proteinDensity =
            coerced.calories > 0
              ? (coerced.protein * 500) / coerced.calories
              : 0;

          return proteinDensity >= 20;
        })
    : [];

  const isValid =
    typeof coerced.summary === "string" &&
    coerced.summary.trim().length > 0 &&
    numericFields.every(
      (field) =>
        typeof coerced[field] === "number"
    );

  if (!isValid) {
    throw new Error(
      "Invalid nutrition response from AI."
    );
  }

  return {
    summary: cleanText(
      coerced.summary,
      1000
    ),

    calories: coerced.calories,
    protein: coerced.protein,
    carbs: coerced.carbs,
    fat: coerced.fat,
    fiber: coerced.fiber,

    feedback,
  };
};

/* =====================================================
   RECIPE SUGGESTION
===================================================== */

export const getRecipeSuggestion = async (
  ingredients,
  profile = null
) => {
  if (
    !Array.isArray(ingredients) ||
    ingredients.length === 0
  ) {
    throw new Error(
      "At least one ingredient is required."
    );
  }

  const safeIngredients = ingredients
    .filter(
      (ingredient) =>
        typeof ingredient === "string"
    )
    .map((ingredient) =>
      cleanText(ingredient, 100)
    )
    .filter(Boolean)
    .slice(0, 100);

  if (safeIngredients.length === 0) {
    throw new Error(
      "No valid ingredients were provided."
    );
  }

  const profileContext =
    buildProfileContext(profile);

  const prompt = `
${profileContext}

Suggest exactly 3 practical recipes using these ingredients:

${safeIngredients.join(", ")}

Rules:
- Prioritize the supplied ingredients.
- Common staples such as salt, oil, spices and water may be assumed.
- Avoid expensive or uncommon ingredients.
- Respect the user's dietary preference.
- Do not intentionally include listed allergens.
- Do not make medical claims.
- Return ONLY valid JSON.

Each recipe must contain:
- name
- difficulty
- cookTime
- ingredients
- recipe

Return exactly:

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
      "recipe": "Short step-by-step instructions."
    }
  ]
}
`;

  const result = await enqueueRequest(prompt);

  const recipes = Array.isArray(result?.recipes)
    ? result.recipes
        .filter(
          (recipe) =>
            recipe &&
            typeof recipe.name === "string" &&
            typeof recipe.difficulty === "string" &&
            typeof recipe.cookTime === "string" &&
            Array.isArray(recipe.ingredients) &&
            typeof recipe.recipe === "string"
        )
        .slice(0, 3)
        .map((recipe) => ({
          name: cleanText(recipe.name, 150),
          difficulty: cleanText(
            recipe.difficulty,
            50
          ),
          cookTime: cleanText(
            recipe.cookTime,
            50
          ),
          ingredients: recipe.ingredients
            .filter(
              (item) =>
                typeof item === "string"
            )
            .map((item) =>
              cleanText(item, 150)
            )
            .filter(Boolean)
            .slice(0, 30),
          recipe: cleanText(
            recipe.recipe,
            3000
          ),
        }))
    : [];

  if (recipes.length !== 3) {
    throw new Error(
      "AI did not return exactly 3 valid recipes."
    );
  }

  return {
    recipes,
  };
};

/* =====================================================
   PANTRY WRAPPER
===================================================== */

export const generateRecipesFromIngredients =
  async (ingredients, profile = null) => {
    const result =
      await getRecipeSuggestion(
        ingredients,
        profile
      );

    return result.recipes;
  };
