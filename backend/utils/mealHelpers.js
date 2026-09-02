// utils/mealHelpers.js
//
// Small shared helpers used by both routes/calorie.js and routes/meals.js so
// the "find or create today's calorie bucket" and "recompute total" logic
// lives in exactly one place.

import MealEntry from "../models/MealEntry.js";

/**
 * Finds (or creates) the authenticated user's MealEntry for `date`
 * (YYYY-MM-DD, already resolved to the user's local timezone by the
 * caller). `dailyGoalFallback` is only used when creating a brand new
 * entry — existing entries keep whatever goal they already have.
 */
export async function findOrCreateEntry(userId, date, dailyGoalFallback) {
  let entry = await MealEntry.findOne({ userId, date });
  if (!entry) {
    entry = await MealEntry.create({
      userId,
      date,
      dailyGoal: dailyGoalFallback,
      meals: { breakfast: 0, lunch: 0, dinner: 0, eveningSnack: 0 },
      totalCalories: 0,
      waterIntake: 0,
    });
  }
  return entry;
}

/** Recomputes totalCalories from the four meal buckets. */
export function recalcTotalCalories(entry) {
  const values = Object.values(entry.meals || {});
  entry.totalCalories = values.reduce((sum, val) => sum + (val || 0), 0);
  return entry.totalCalories;
}

/**
 * Adds `calories` to the given mealType bucket for the user's entry on
 * `date`, creating the entry if needed, and saves it.
 */
export async function addCaloriesToEntry({ userId, date, mealType, calories, dailyGoalFallback }) {
  const entry = await findOrCreateEntry(userId, date, dailyGoalFallback);
  entry.meals[mealType] = (entry.meals[mealType] || 0) + calories;
  recalcTotalCalories(entry);
  await entry.save();
  return entry;
}