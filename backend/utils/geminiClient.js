import dotenv from "dotenv";
import fetch from "node-fetch";

import { generateJsonWithGroq } from "./groqClient.js";

dotenv.config();

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const REQUEST_TIMEOUT_MS = 30_000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

const cache = new Map();

function cleanText(value, maxLength = 700) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function getCached(key) {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  if (
    Date.now() - cached.createdAt >
    CACHE_TTL_MS
  ) {
    cache.delete(key);
    return null;
  }

  return cached.value;
}

function setCached(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey =
      cache.keys().next().value;

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, {
    value,
    createdAt: Date.now(),
  });
}

async function requestGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const cached = getCached(prompt);

  if (cached) {
    return cached;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      `${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=` +
      encodeURIComponent(
        process.env.GEMINI_API_KEY
      );

    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      signal: controller.signal,

      body: JSON.stringify({
        contents: [
          {
            role: "user",

            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: 0.2,
          responseMimeType:
            "application/json",
        },
      }),
    });

    const body = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        body?.error?.message ||
          `Gemini API request failed with status ${response.status}`
      );
    }

    const raw =
      body?.candidates?.[0]?.content
        ?.parts?.[0]?.text;

    if (
      typeof raw !== "string" ||
      !raw.trim()
    ) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    setCached(prompt, parsed);

    return parsed;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Gemini request timed out."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateProgressInsights(
  dashboard
) {
  if (
    !dashboard ||
    !Array.isArray(
      dashboard.caloriesTrend
    ) ||
    !Array.isArray(
      dashboard.waterTrend
    )
  ) {
    throw new Error(
      "Invalid dashboard data supplied for AI insights."
    );
  }

  const trackedCalorieDays =
    dashboard.caloriesTrend.filter(
      (day) =>
        Number(day?.calories) > 0
    ).length;

  const trackedWaterDays =
    dashboard.waterTrend.filter(
      (day) =>
        Number(day?.water) > 0
    ).length;

  const prompt = `
You are interpreting charts in a nutrition tracking app.

Explain only what the supplied data supports.

Important rules:
- Missing days or zero values may mean "not logged".
- Never describe missing data as confirmed zero consumption.
- Do not diagnose, moralise, or provide medical advice.
- Do not describe being below a calorie goal as inherently good.
- Clearly mention when incomplete logging limits the interpretation.
- Use plain and useful language.
- Use concrete numbers when they help explain the graph.
- Each explanation must describe the corresponding graph.
- Return only valid JSON.

Dashboard data:

${JSON.stringify({
  rangeDays: dashboard.rangeDays,
  trackedCalorieDays,
  trackedWaterDays,
  averageCalories:
    dashboard.averageCalories,
  caloriesTrend:
    dashboard.caloriesTrend,
  waterTrend:
    dashboard.waterTrend,
  macros: dashboard.macros,
  mealsTracked:
    dashboard.mealsTracked,
})}

Return exactly this JSON structure:

{
  "calorieTrend": "Explain how logged calories changed over the selected period and whether enough days were logged to identify a reliable trend.",
  "goalComparison": "Explain how the logged calorie values compare with the displayed daily calorie goal without judging the result.",
  "macroDistribution": "Explain which of protein, carbohydrates and fat dominates the logged totals. Mention fibre separately because fibre overlaps with carbohydrates.",
  "waterTrend": "Explain the logged water-intake pattern and whether missing days limit the interpretation.",
  "overall": "Give the single most useful takeaway from all the available dashboard statistics."
}

Each value must contain one or two concise sentences.
Use null only when there is not enough data to explain a graph.
`;

  let result;

  try {
    result =
      await requestGemini(prompt);
  } catch (geminiError) {
    console.warn(
      "Gemini progress insights unavailable; using Groq fallback:",
      geminiError?.message ||
        geminiError
    );

    result =
      await generateJsonWithGroq(
        prompt
      );
  }

  const keys = [
    "calorieTrend",
    "goalComparison",
    "macroDistribution",
    "waterTrend",
    "overall",
  ];

  const insights = {};

  for (const key of keys) {
    const value = result?.[key];

    insights[key] =
      value === null ||
      value === undefined
        ? null
        : cleanText(value);
  }

  const hasAtLeastOneInsight =
    Object.values(insights).some(
      (value) =>
        typeof value === "string" &&
        value.length > 0
    );

  if (!hasAtLeastOneInsight) {
    throw new Error(
      "AI providers did not return valid progress insights."
    );
  }

  return insights;
}