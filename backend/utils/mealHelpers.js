// utils/mealHelpers.js

import MealEntry from "../models/MealEntry.js";

const MEAL_BUCKETS = [
  "breakfast",
  "lunch",
  "dinner",
  "eveningSnack",
];

const DEFAULT_DAILY_GOAL = 2000;

/**
 * Safely converts a value into a non-negative finite number.
 */
function toNonNegativeNumber(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return number;
}

/**
 * Ensures the four expected meal buckets always exist.
 *
 * This protects the application from older/incomplete database documents.
 */
function normalizeMealBuckets(meals = {}) {
  return {
    breakfast: toNonNegativeNumber(meals.breakfast),
    lunch: toNonNegativeNumber(meals.lunch),
    dinner: toNonNegativeNumber(meals.dinner),
    eveningSnack: toNonNegativeNumber(meals.eveningSnack),
  };
}

/**
 * Finds today's MealEntry for the authenticated user.
 *
 * If it does not exist, creates it using the supplied calorie goal.
 *
 * `dailyGoalFallback` is only used when creating a new entry.
 * Existing entries retain their existing goal.
 */
export async function findOrCreateEntry(
  userId,
  date,
  dailyGoalFallback = DEFAULT_DAILY_GOAL
) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid date");
  }

  const safeGoal = toNonNegativeNumber(
    dailyGoalFallback,
    DEFAULT_DAILY_GOAL
  );

  let entry = await MealEntry.findOne({
    userId,
    date,
  });

  if (!entry) {
    entry = await MealEntry.create({
      userId,
      date,
      dailyGoal: safeGoal,
      meals: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        eveningSnack: 0,
      },
      totalCalories: 0,
      waterIntake: 0,
    });

    return entry;
  }

  // Normalize older/incomplete documents before returning them.
  entry.meals = normalizeMealBuckets(entry.meals);

  entry.dailyGoal = toNonNegativeNumber(
    entry.dailyGoal,
    safeGoal
  );

  entry.totalCalories = recalcTotalCalories(entry);

  return entry;
}

/**
 * Recomputes total calories from the four meal buckets.
 */
export function recalcTotalCalories(entry) {
  if (!entry) {
    throw new Error("MealEntry is required");
  }

  const meals = normalizeMealBuckets(entry.meals);

  entry.meals = meals;

  entry.totalCalories =
    meals.breakfast +
    meals.lunch +
    meals.dinner +
    meals.eveningSnack;

  return entry.totalCalories;
}

/**
 * Adds calories to one meal bucket and persists the entry.
 */
export async function addCaloriesToEntry({
  userId,
  date,
  mealType,
  calories,
  dailyGoalFallback = DEFAULT_DAILY_GOAL,
}) {
  if (!MEAL_BUCKETS.includes(mealType)) {
    throw new Error("Invalid mealType");
  }

  const safeCalories = toNonNegativeNumber(calories);

  const entry = await findOrCreateEntry(
    userId,
    date,
    dailyGoalFallback
  );

  entry.meals = normalizeMealBuckets(entry.meals);

  entry.meals[mealType] += safeCalories;

  recalcTotalCalories(entry);

  await entry.save();

  return entry;
}

/**
 * Sets one meal bucket to an exact calorie value.
 */
export async function setCaloriesForEntry({
  userId,
  date,
  mealType,
  calories,
  dailyGoalFallback = DEFAULT_DAILY_GOAL,
}) {
  if (!MEAL_BUCKETS.includes(mealType)) {
    throw new Error("Invalid mealType");
  }

  const safeCalories = toNonNegativeNumber(calories);

  const entry = await findOrCreateEntry(
    userId,
    date,
    dailyGoalFallback
  );

  entry.meals = normalizeMealBuckets(entry.meals);

  entry.meals[mealType] = safeCalories;

  recalcTotalCalories(entry);

  await entry.save();

  return entry;
}

export { MEAL_BUCKETS };