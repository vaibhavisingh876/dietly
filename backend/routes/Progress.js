import express from "express";
import MealEntry from "../models/MealEntry.js";
import Meal from "../models/Meal.js";
import UserProfile from "../models/UserProfile.js";
import Progress from "../models/progress.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { resolveTimezone, getLocalDateString, shiftDateString } from "../utils/dateUtils.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

const DEFAULT_CALORIE_GOAL = 2000;

/**
 * All dates the user actually "tracked" — i.e. has a MealEntry with real
 * calories logged, or logged at least one Meal. This is the single
 * definition of a tracked day, used for both the streak and the dashboard.
 * Everything here comes from persisted documents; nothing is trusted from
 * the client.
 */
async function getTrackedDateSet(userId) {
  const [entries, meals] = await Promise.all([
    MealEntry.find({ userId, totalCalories: { $gt: 0 } }, { date: 1 }).lean(),
    Meal.find({ userId, date: { $exists: true, $ne: null } }, { date: 1 }).lean(),
  ]);
  return new Set([...entries.map((e) => e.date), ...meals.map((m) => m.date)]);
}

/**
 * Real, database-backed streak calculation.
 * currentStreak: consecutive tracked days ending today (or yesterday, if
 * today hasn't been logged yet) — walking backward day by day.
 * longestStreak: the longest run of consecutive tracked days ever.
 */
async function computeStreaks(userId, tz) {
  const trackedDates = await getTrackedDateSet(userId);
  const today = getLocalDateString(tz);

  let currentStreak = 0;
  let cursor = trackedDates.has(today) ? today : shiftDateString(today, -1);
  while (trackedDates.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDateString(cursor, -1);
  }

  const sortedDates = Array.from(trackedDates).sort();
  let longestStreak = 0;
  let run = 0;
  let prevDate = null;
  for (const date of sortedDates) {
    run = prevDate && shiftDateString(prevDate, 1) === date ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    prevDate = date;
  }

  return { currentStreak, longestStreak };
}

// =====================================================
// GET /api/progress/streak — lightweight, used by the Analyze page to show
// a real (not session-counted) streak after logging a meal.
// =====================================================
router.get("/streak", async (req, res) => {
  try {
    const tz = resolveTimezone(req);
    const { currentStreak, longestStreak } = await computeStreaks(req.user.id, tz);
    res.json({ success: true, currentStreak, longestStreak });
  } catch (err) {
    console.error("Streak error:", err);
    res.status(500).json({ success: false, error: "Failed to compute streak" });
  }
});

// =====================================================
// GET /api/progress/dashboard?days=7 — everything the Progress page needs,
// derived entirely from MealEntry + Meal + UserProfile. The client only
// picks the date-range length; it cannot influence the numbers themselves.
// =====================================================
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.user.id;
    const tz = resolveTimezone(req);
    const days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7));
    const today = getLocalDateString(tz);

    const dateRange = [];
    for (let i = days - 1; i >= 0; i--) {
      dateRange.push(shiftDateString(today, -i));
    }

    const profile = await UserProfile.findOne({ userId }).lean();
    const fallbackGoal = profile?.calorieGoalOverride || profile?.calorieGoal || DEFAULT_CALORIE_GOAL;

    const [entries, meals, { currentStreak, longestStreak }] = await Promise.all([
      MealEntry.find({ userId, date: { $in: dateRange } }).lean(),
      Meal.find({ userId, date: { $in: dateRange } }).sort({ createdAt: -1 }).lean(),
      computeStreaks(userId, tz),
    ]);

    const entryByDate = new Map(entries.map((e) => [e.date, e]));

    const caloriesTrend = dateRange.map((date) => ({
      date,
      calories: entryByDate.get(date)?.totalCalories || 0,
      goal: entryByDate.get(date)?.dailyGoal || fallbackGoal,
    }));

    const waterTrend = dateRange.map((date) => ({
      date,
      water: entryByDate.get(date)?.waterIntake || 0,
    }));

    const macros = meals.reduce(
      (acc, m) => {
        acc.protein += m.protein || 0;
        acc.carbs += m.carbs || 0;
        acc.fat += m.fat || 0;
        acc.fiber += m.fiber || 0;
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const mealsPerDay = {};
    for (const date of dateRange) mealsPerDay[date] = 0;
    for (const m of meals) {
      if (mealsPerDay[m.date] !== undefined) mealsPerDay[m.date] += 1;
    }

    const todayEntry = entryByDate.get(today);
    const todayCalories = todayEntry?.totalCalories || 0;
    const todayGoal = todayEntry?.dailyGoal || fallbackGoal;

    const daysWithCalories = caloriesTrend.filter((d) => d.calories > 0);
    const averageCalories = daysWithCalories.length
      ? Math.round(daysWithCalories.reduce((sum, d) => sum + d.calories, 0) / daysWithCalories.length)
      : 0;

    res.json({
      success: true,
      dashboard: {
        rangeDays: days,
        today: {
          date: today,
          calories: todayCalories,
          goal: todayGoal,
          remaining: Math.max(0, todayGoal - todayCalories),
          water: todayEntry?.waterIntake || 0,
        },
        averageCalories,
        caloriesTrend,
        waterTrend,
        macros,
        mealsTracked: meals.length,
        mealsPerDay,
        recentMeals: meals.slice(0, 10).map((m) => ({
          id: m._id,
          name: m.name,
          calories: m.calories || 0,
          protein: m.protein || 0,
          carbs: m.carbs || 0,
          fat: m.fat || 0,
          fiber: m.fiber || 0,
          aiGenerated: m.aiGenerated,
          date: m.date,
          createdAt: m.createdAt,
        })),
        streak: { current: currentStreak, longest: longestStreak },
      },
    });
  } catch (err) {
    console.error("Progress dashboard error:", err);
    res.status(500).json({ success: false, error: "Failed to load progress" });
  }
});

// =====================================================
// GET /api/progress — legacy read-only endpoint kept for backward
// compatibility. Nothing in the current frontend calls this; real
// analytics now come from /dashboard above, derived from MealEntry/Meal
// instead of this separate (and previously client-writable) collection.
// The old POST /add endpoint has been removed: it accepted arbitrary
// caloriesConsumed/protein/carbs/fats/mealsTracked values directly from
// the client, which is exactly the kind of untrusted, duplicate-source-of-
// truth data this rewrite is meant to eliminate. The Progress model
// itself is left in place (not deleted) in case any historical records
// need to be read or migrated later.
// =====================================================
router.get("/", async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id }).sort({ date: -1 }).lean();
    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching legacy progress records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;