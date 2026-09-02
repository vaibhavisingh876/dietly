// utils/allergyFilter.js
//
// Deterministic, keyword-based allergen safety net. The AI is asked to
// respect the user's allergies, but LLM output is never a reliable sole
// safety layer for allergy avoidance — so this module gives us a simple,
// predictable, non-AI check that runs on top of whatever the model returns.
//
// This is intentionally basic keyword matching, not a medical or exhaustive
// food-science tool. It is meant to catch obvious conflicts (e.g. "paneer"
// for a Dairy allergy) and surface them clearly — never to certify that a
// meal or recipe is safe.

const ALLERGEN_KEYWORDS = {
  Dairy: [
    "milk", "paneer", "cheese", "curd", "yogurt", "yoghurt", "ghee",
    "cream", "butter", "khoya", "malai", "lassi", "buttermilk",
  ],
  Gluten: [
    "wheat", "roti", "chapati", "naan", "bread", "maida", "atta",
    "pasta", "noodles", "gluten", "semolina", "suji", "barley", "rye",
  ],
  Eggs: ["egg", "eggs", "omelette", "omelet", "mayonnaise", "mayo"],
  Fish: [
    "fish", "salmon", "tuna", "prawn", "shrimp", "crab", "seafood",
    "anchovy", "sardine", "mackerel",
  ],
};

/**
 * Scans free text (meal description, AI summary, ingredient list, recipe
 * instructions, etc.) for keywords tied to the given allergy list.
 * Returns the subset of `allergies` that appear to conflict with the text.
 */
export function detectAllergenConflicts(text, allergies = []) {
  if (!text || !Array.isArray(allergies) || allergies.length === 0) return [];

  const haystack = String(text).toLowerCase();
  const conflicts = [];

  for (const allergy of allergies) {
    const keywords = ALLERGEN_KEYWORDS[allergy];
    if (!keywords) continue;
    const hit = keywords.some((kw) => haystack.includes(kw));
    if (hit) conflicts.push(allergy);
  }

  return conflicts;
}

/**
 * Convenience helper for meal analysis: checks the raw meal text plus the
 * AI's own summary, and returns feedback-shaped warning entries for any
 * allergy conflicts that were found. If the AI already mentioned the
 * conflict in its feedback, we still add our own entry — duplicated,
 * clearly-worded warnings are safer than a missed one.
 */
export function buildAllergyWarnings(mealText, aiSummary, allergies = []) {
  const combinedText = `${mealText || ""} ${aiSummary || ""}`;
  const conflicts = detectAllergenConflicts(combinedText, allergies);

  return conflicts.map((allergy) => ({
    text: `Contains or likely contains ${allergy.toLowerCase()}, which conflicts with your ${allergy} allergy/intolerance. Double-check ingredients before eating.`,
    type: "warning",
  }));
}

/**
 * Filters AI-generated recipes down to the ones that don't appear to
 * conflict with the user's allergies, based on their ingredient list and
 * recipe text. This is the backend safety layer for Pantry recipe
 * suggestions — it runs in addition to (not instead of) asking the AI to
 * avoid the allergens.
 */
export function filterRecipesForAllergies(recipes = [], allergies = []) {
  if (!Array.isArray(allergies) || allergies.length === 0) return recipes;

  return recipes.filter((recipe) => {
    const text = [
      recipe.name,
      recipe.recipe,
      ...(Array.isArray(recipe.ingredients) ? recipe.ingredients : []),
    ]
      .filter(Boolean)
      .join(" ");

    const conflicts = detectAllergenConflicts(text, allergies);
    return conflicts.length === 0;
  });
}

export { ALLERGEN_KEYWORDS };