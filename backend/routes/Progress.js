import express from "express";

import MealEntry from "../models/MealEntry.js";
import Meal from "../models/Meal.js";
import UserProfile from "../models/Userprofile.js";
import Progress from "../models/progress.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  resolveTimezone,
  getLocalDateString,
  shiftDateString,
} from "../utils/dateUtils.js";

const router = express.Router();

router.use(authMiddleware);

const DEFAULT_CALORIE_GOAL = 2000;
const MAX_DASHBOARD_DAYS = 30;

/* =====================================================
   HELPERS
===================================================== */

function toNonNegativeNumber(
  value,
  fallback = 0
) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return number;
}

function getDailyGoal(profile) {
  const override = Number(
    profile?.calorieGoalOverride
  );

  if (
    Number.isFinite(override) &&
    override > 0
  ) {
    return override;
  }

  const calculated = Number(
    profile?.calorieGoal
  );

  if (
    Number.isFinite(calculated) &&
    calculated > 0
  ) {
    return calculated;
  }

  return DEFAULT_CALORIE_GOAL;
}

/**
 * Returns all dates on which the user actually
 * tracked something.
 *
 * A day is considered tracked when:
 * 1. MealEntry has calories > 0, OR
 * 2. At least one Meal document exists for that date.
 */
async function getTrackedDateSet(userId) {
  const [entries, meals] = await Promise.all([
    MealEntry.find(
      {
        userId,
        totalCalories: { $gt: 0 },
      },
      {
        date: 1,
        _id: 0,
      }
    ).lean(),

    Meal.find(
      {
        userId,
        date: {
          $exists: true,
          $ne: null,
        },
      },
      {
        date: 1,
        _id: 0,
      }
    ).lean(),
  ]);

  return new Set([
    ...entries
      .map((entry) => entry.date)
      .filter(Boolean),

    ...meals
      .map((meal) => meal.date)
      .filter(Boolean),
  ]);
}

/**
 * Calculates current and longest streak.
 */
async function computeStreaks(
  userId,
  timezone
) {
  const trackedDates =
    await getTrackedDateSet(userId);

  const today =
    getLocalDateString(timezone);

  let currentStreak = 0;

  /*
   * If today isn't tracked yet, yesterday can still
   * be the end of the current streak.
   */
  let cursor = trackedDates.has(today)
    ? today
    : shiftDateString(today, -1);

  while (trackedDates.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDateString(cursor, -1);
  }

  /*
   * Longest streak.
   */
  const sortedDates = Array.from(
    trackedDates
  ).sort();

  let longestStreak = 0;
  let run = 0;
  let previousDate = null;

  for (const date of sortedDates) {
    if (
      previousDate &&
      shiftDateString(previousDate, 1) ===
        date
    ) {
      run += 1;
    } else {
      run = 1;
    }

    longestStreak = Math.max(
      longestStreak,
      run
    );

    previousDate = date;
  }

  return {
    currentStreak,
    longestStreak,
  };
}

/* =====================================================
   GET /api/progress/streak
===================================================== */

router.get(
  "/streak",
  async (req, res) => {
    try {
      const timezone =
        resolveTimezone(req);

      const {
        currentStreak,
        longestStreak,
      } = await computeStreaks(
        req.user.id,
        timezone
      );

      return res.json({
        success: true,
        currentStreak,
        longestStreak,
      });
    } catch (error) {
      console.error(
        "Streak error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to compute streak",
      });
    }
  }
);

/* =====================================================
   GET /api/progress/dashboard?days=7
===================================================== */

router.get(
  "/dashboard",
  async (req, res) => {
    try {
      const userId = req.user.id;
      const timezone =
        resolveTimezone(req);

      const requestedDays = Number.parseInt(
        req.query.days,
        10
      );

      const days = Number.isFinite(
        requestedDays
      )
        ? Math.min(
            MAX_DASHBOARD_DAYS,
            Math.max(1, requestedDays)
          )
        : 7;

      const today =
        getLocalDateString(timezone);

      const dateRange = [];

      for (
        let i = days - 1;
        i >= 0;
        i--
      ) {
        dateRange.push(
          shiftDateString(today, -i)
        );
      }

      /*
       * Load profile and all analytics data
       * concurrently where possible.
       */
      const [
        profile,
        entries,
        meals,
        streaks,
      ] = await Promise.all([
        UserProfile.findOne({
          userId,
        }).lean(),

        MealEntry.find({
          userId,
          date: {
            $in: dateRange,
          },
        }).lean(),

        Meal.find({
          userId,
          date: {
            $in: dateRange,
          },
        })
          .sort({
            createdAt: -1,
          })
          .lean(),

        computeStreaks(
          userId,
          timezone
        ),
      ]);

      const fallbackGoal =
        getDailyGoal(profile);

      /* ---------------------------------------------
         ENTRY LOOKUP
      --------------------------------------------- */

      const entryByDate = new Map(
        entries.map((entry) => [
          entry.date,
          entry,
        ])
      );

      /* ---------------------------------------------
         CALORIE TREND
      --------------------------------------------- */

      const caloriesTrend =
        dateRange.map((date) => {
          const entry =
            entryByDate.get(date);

          const calories =
            toNonNegativeNumber(
              entry?.totalCalories
            );

          const goal =
            toNonNegativeNumber(
              entry?.dailyGoal,
              fallbackGoal
            ) || fallbackGoal;

          return {
            date,
            calories,
            goal,
          };
        });

      /* ---------------------------------------------
         WATER TREND
      --------------------------------------------- */

      const waterTrend =
        dateRange.map((date) => {
          const entry =
            entryByDate.get(date);

          return {
            date,

            water:
              toNonNegativeNumber(
                entry?.waterIntake
              ),
          };
        });

      /* ---------------------------------------------
         MACROS
      --------------------------------------------- */

      const macros = meals.reduce(
        (acc, meal) => {
          acc.protein +=
            toNonNegativeNumber(
              meal.protein
            );

          acc.carbs +=
            toNonNegativeNumber(
              meal.carbs
            );

          acc.fat +=
            toNonNegativeNumber(
              meal.fat
            );

          acc.fiber +=
            toNonNegativeNumber(
              meal.fiber
            );

          return acc;
        },
        {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        }
      );

      /* ---------------------------------------------
         MEALS PER DAY
      --------------------------------------------- */

      const mealsPerDay = {};

      for (const date of dateRange) {
        mealsPerDay[date] = 0;
      }

      for (const meal of meals) {
        if (
          Object.prototype.hasOwnProperty.call(
            mealsPerDay,
            meal.date
          )
        ) {
          mealsPerDay[meal.date] += 1;
        }
      }

      /* ---------------------------------------------
         TODAY
      --------------------------------------------- */

      const todayEntry =
        entryByDate.get(today);

      const todayCalories =
        toNonNegativeNumber(
          todayEntry?.totalCalories
        );

      const todayGoal =
        toNonNegativeNumber(
          todayEntry?.dailyGoal,
          fallbackGoal
        ) || fallbackGoal;

      const todayWater =
        toNonNegativeNumber(
          todayEntry?.waterIntake
        );

      /* ---------------------------------------------
         AVERAGE CALORIES
      --------------------------------------------- */

      const daysWithCalories =
        caloriesTrend.filter(
          (day) => day.calories > 0
        );

      const averageCalories =
        daysWithCalories.length > 0
          ? Math.round(
              daysWithCalories.reduce(
                (sum, day) =>
                  sum + day.calories,
                0
              ) /
                daysWithCalories.length
            )
          : 0;

      /* ---------------------------------------------
         RECENT MEALS
      --------------------------------------------- */

      const recentMeals =
        meals.slice(0, 10).map(
          (meal) => ({
            id: meal._id,
            name: meal.name,

            calories:
              toNonNegativeNumber(
                meal.calories
              ),

            protein:
              toNonNegativeNumber(
                meal.protein
              ),

            carbs:
              toNonNegativeNumber(
                meal.carbs
              ),

            fat:
              toNonNegativeNumber(
                meal.fat
              ),

            fiber:
              toNonNegativeNumber(
                meal.fiber
              ),

            aiGenerated:
              Boolean(
                meal.aiGenerated
              ),

            date: meal.date,
            createdAt:
              meal.createdAt,
          })
        );

      /* ---------------------------------------------
         RESPONSE
      --------------------------------------------- */

      return res.json({
        success: true,

        dashboard: {
          rangeDays: days,

          today: {
            date: today,
            calories: todayCalories,
            goal: todayGoal,

            remaining: Math.max(
              0,
              todayGoal -
                todayCalories
            ),

            water: todayWater,
          },

          averageCalories,

          caloriesTrend,

          waterTrend,

          macros,

          mealsTracked:
            meals.length,

          mealsPerDay,

          recentMeals,

          streak: {
            current:
              streaks.currentStreak,

            longest:
              streaks.longestStreak,
          },
        },
      });
    } catch (error) {
      console.error(
        "Progress dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to load progress",
      });
    }
  }
);

/* =====================================================
   LEGACY GET /api/progress
===================================================== */

router.get(
  "/",
  async (req, res) => {
    try {
      const progress =
        await Progress.find({
          userId: req.user.id,
        })
          .sort({
            date: -1,
          })
          .lean();

      return res.status(200).json(
        progress
      );
    } catch (error) {
      console.error(
        "Error fetching legacy progress records:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

export default router;