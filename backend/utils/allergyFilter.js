// utils/allergyFilter.js

/*
 * Deterministic, keyword-based allergen safety net.
 *
 * The AI is instructed to respect user allergies, but AI output
 * should never be treated as a medical-grade allergy checker.
 *
 * This module catches obvious conflicts and surfaces a warning.
 * It does NOT certify that a meal is allergy-safe.
 */

const ALLERGEN_KEYWORDS = {
  Dairy: [
    "milk",
    "paneer",
    "cheese",
    "curd",
    "yogurt",
    "yoghurt",
    "ghee",
    "cream",
    "butter",
    "khoya",
    "mawa",
    "malai",
    "lassi",
    "buttermilk",
    "whey",
    "casein",
  ],

  Gluten: [
    "wheat",
    "roti",
    "chapati",
    "naan",
    "bread",
    "maida",
    "atta",
    "pasta",
    "noodles",
    "gluten",
    "semolina",
    "suji",
    "sooji",
    "barley",
    "rye",
    "couscous",
  ],

  Eggs: [
    "egg",
    "eggs",
    "omelette",
    "omelet",
    "mayonnaise",
    "mayo",
    "meringue",
  ],

  Fish: [
    "fish",
    "salmon",
    "tuna",
    "prawn",
    "prawns",
    "shrimp",
    "crab",
    "seafood",
    "anchovy",
    "sardine",
    "mackerel",
  ],
};

const SUPPORTED_ALLERGIES =
  Object.keys(
    ALLERGEN_KEYWORDS
  );

/**
 * Normalizes text before matching.
 */
function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether a keyword exists as a complete word/phrase.
 *
 * Word-boundary matching avoids false positives such as:
 * "eggplant" matching "egg".
 */
function containsKeyword(
  text,
  keyword
) {
  const normalizedText =
    normalizeText(text);

  const normalizedKeyword =
    normalizeText(keyword);

  if (
    !normalizedText ||
    !normalizedKeyword
  ) {
    return false;
  }

  const escapedKeyword =
    normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const pattern = new RegExp(
    `(^|\\s)${escapedKeyword}(?=\\s|$)`,
    "i"
  );

  return pattern.test(
    normalizedText
  );
}

/**
 * Returns allergies that appear
 * to conflict with supplied text.
 */
export function detectAllergenConflicts(
  text,
  allergies = []
) {
  if (
    !text ||
    !Array.isArray(allergies) ||
    allergies.length === 0
  ) {
    return [];
  }

  const conflicts = [];

  for (const allergy of allergies) {
    if (
      !SUPPORTED_ALLERGIES.includes(
        allergy
      )
    ) {
      continue;
    }

    const keywords =
      ALLERGEN_KEYWORDS[
        allergy
      ];

    const hasConflict =
      keywords.some(
        (keyword) =>
          containsKeyword(
            text,
            keyword
          )
      );

    if (hasConflict) {
      conflicts.push(allergy);
    }
  }

  return [
    ...new Set(conflicts),
  ];
}

/**
 * Builds feedback-shaped warnings.
 *
 * Checks both original meal text
 * and AI-generated summary.
 */
export function buildAllergyWarnings(
  mealText,
  aiSummary,
  allergies = []
) {
  const combinedText = [
    mealText,
    aiSummary,
  ]
    .filter(Boolean)
    .join(" ");

  const conflicts =
    detectAllergenConflicts(
      combinedText,
      allergies
    );

  return conflicts.map(
    (allergy) => ({
      text:
        `Contains or may contain ${allergy.toLowerCase()}, ` +
        `which conflicts with your ${allergy} allergy/intolerance. ` +
        `Double-check the ingredients before eating.`,
      type: "warning",
    })
  );
}

/**
 * Filters AI-generated pantry recipes
 * using deterministic allergy checks.
 */
export function filterRecipesForAllergies(
  recipes = [],
  allergies = []
) {
  if (!Array.isArray(recipes)) {
    return [];
  }

  if (
    !Array.isArray(allergies) ||
    allergies.length === 0
  ) {
    return recipes;
  }

  return recipes.filter(
    (recipe) => {
      if (
        !recipe ||
        typeof recipe !==
          "object"
      ) {
        return false;
      }

      const text = [
        recipe.name,
        recipe.recipe,
        ...(Array.isArray(
          recipe.ingredients
        )
          ? recipe.ingredients
          : []),
      ]
        .filter(Boolean)
        .join(" ");

      const conflicts =
        detectAllergenConflicts(
          text,
          allergies
        );

      return (
        conflicts.length === 0
      );
    }
  );
}

export {
  ALLERGEN_KEYWORDS,
};