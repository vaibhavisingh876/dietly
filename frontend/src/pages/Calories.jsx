import React, { useEffect, useState } from "react";
import api from "../api/api";

const MEAL_TYPES = [
  {
    key: "breakfast",
    label: "Breakfast",
  },
  {
    key: "lunch",
    label: "Lunch",
  },
  {
    key: "dinner",
    label: "Dinner",
  },
  {
    key: "eveningSnack",
    label: "Evening Snack",
  },
];

function toSafeNumber(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return number;
}

function getInitialMeals() {
  return {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    eveningSnack: 0,
  };
}

export default function Calories() {
  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [mealText, setMealText] =
    useState("");

  const [selectedMealType, setSelectedMealType] =
    useState("breakfast");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [manualCalories, setManualCalories] =
    useState(getInitialMeals());

  const [manualLoading, setManualLoading] =
    useState({});

  const [water, setWater] =
    useState("");

  const [waterLoading, setWaterLoading] =
    useState(false);

  /* ===================================================
     LOAD TODAY
  =================================================== */

  const loadToday = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get("/calorie/today");

      // Backend returns { entry }, not { data }
      const today =
        response.data?.entry;

      if (!today) {
        throw new Error(
          "Invalid calorie data received."
        );
      }

      setData(today);

      setManualCalories({
        breakfast:
          toSafeNumber(
            today.meals?.breakfast
          ),

        lunch:
          toSafeNumber(
            today.meals?.lunch
          ),

        dinner:
          toSafeNumber(
            today.meals?.dinner
          ),

        eveningSnack:
          toSafeNumber(
            today.meals?.eveningSnack
          ),
      });

      setWater(
        String(
          toSafeNumber(
            today.waterIntake
          )
        )
      );
    } catch (err) {
      console.error(
        "Failed to load calorie data:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to load today's calorie data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  /* ===================================================
     AI MEAL
  =================================================== */

  const addMealWithAI = async () => {
    const cleanedText =
      mealText.trim();

    if (!cleanedText) {
      setError(
        "Please describe your meal first."
      );
      return;
    }

    if (cleanedText.length > 1000) {
      setError(
        "Meal description must be 1000 characters or less."
      );
      return;
    }

    setAiLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await api.post(
          "/calorie/add-meal-text",
          {
            mealType: selectedMealType,
            mealText: cleanedText,
          }
        );

      // Backend returns { calories, entry, mealId }
      const updated =
        response.data?.entry;

      if (!updated) {
        throw new Error(
          "Invalid response from server."
        );
      }

      setData(updated);

      setManualCalories({
        breakfast:
          toSafeNumber(
            updated.meals?.breakfast
          ),

        lunch:
          toSafeNumber(
            updated.meals?.lunch
          ),

        dinner:
          toSafeNumber(
            updated.meals?.dinner
          ),

        eveningSnack:
          toSafeNumber(
            updated.meals?.eveningSnack
          ),
      });

      setWater(
        String(
          toSafeNumber(
            updated.waterIntake
          )
        )
      );

      setMealText("");

      setSuccess(
        "Meal analyzed and added successfully."
      );
    } catch (err) {
      console.error(
        "AI calorie error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to analyze this meal."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* ===================================================
     MANUAL CALORIES
  =================================================== */

  const updateManualCalories = async (
    mealType
  ) => {
    const raw =
      manualCalories[mealType];

    if (
      raw === "" ||
      raw === null ||
      raw === undefined
    ) {
      setError(
        "Please enter a calorie value."
      );
      return;
    }

    const calories =
      Number(raw);

    if (
      !Number.isFinite(calories) ||
      calories < 0 ||
      calories > 10000
    ) {
      setError(
        "Calories must be between 0 and 10,000."
      );
      return;
    }

    setManualLoading((prev) => ({
      ...prev,
      [mealType]: true,
    }));

    setError("");
    setSuccess("");

    try {
      const response =
        await api.post(
          "/calorie/set-meal-calories",
          {
            mealType,
            calories,
          }
        );

      const updated =
        response.data?.entry;

      if (!updated) {
        throw new Error(
          "Invalid response from server."
        );
      }

      setData(updated);

      setManualCalories({
        breakfast:
          toSafeNumber(
            updated.meals?.breakfast
          ),

        lunch:
          toSafeNumber(
            updated.meals?.lunch
          ),

        dinner:
          toSafeNumber(
            updated.meals?.dinner
          ),

        eveningSnack:
          toSafeNumber(
            updated.meals?.eveningSnack
          ),
      });

      setSuccess(
        "Calories updated successfully."
      );
    } catch (err) {
      console.error(
        "Manual calorie update error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to update calories."
      );
    } finally {
      setManualLoading((prev) => ({
        ...prev,
        [mealType]: false,
      }));
    }
  };

  /* ===================================================
     WATER
  =================================================== */

  const updateWater = async () => {
    if (
      water === "" ||
      water === null
    ) {
      setError(
        "Please enter your water intake."
      );
      return;
    }

    const amount =
      Number(water);

    if (
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > 20000
    ) {
      setError(
        "Water intake must be between 0 and 20,000 ml."
      );
      return;
    }

    setWaterLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await api.post(
          "/calorie/set-water",
          {
            amount,
          }
        );

      const updated =
        response.data?.entry;

      if (!updated) {
        throw new Error(
          "Invalid response from server."
        );
      }

      setData(updated);

      setWater(
        String(
          toSafeNumber(
            updated.waterIntake
          )
        )
      );

      setSuccess(
        "Water intake updated successfully."
      );
    } catch (err) {
      console.error(
        "Water update error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to update water intake."
      );
    } finally {
      setWaterLoading(false);
    }
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600 font-medium">
            Loading today's nutrition...
          </p>
        </div>
      </div>
    );
  }

  const goal =
    toSafeNumber(
      data?.dailyGoal,
      2000
    );

  const total =
    toSafeNumber(
      data?.totalCalories
    );

  const remaining =
    Math.max(
      0,
      goal - total
    );

  const progress =
    goal > 0
      ? Math.min(
          100,
          (total / goal) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Today's Calories
          </h1>

          <p className="mt-2 text-gray-600">
            Track your meals, calories and hydration.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
            {success}
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <div>
              <p className="text-sm text-gray-500">
                Consumed
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {Math.round(total)} kcal
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Daily Goal
              </p>

              <p className="text-3xl font-bold text-green-700">
                {Math.round(goal)} kcal
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Remaining
              </p>

              <p className="text-3xl font-bold text-emerald-700">
                {Math.round(remaining)} kcal
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">
                Daily progress
              </span>

              <span className="font-semibold text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Meal Entry */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Add Meal with AI
          </h2>

          <p className="text-gray-600 mt-2">
            Describe what you ate and AI will estimate
            the calories and nutrition.
          </p>

          {/* Meal type selector */}
          <div className="mt-5">
            <label
              htmlFor="ai-meal-type"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Meal Type
            </label>

            <select
              id="ai-meal-type"
              value={selectedMealType}
              onChange={(e) =>
                setSelectedMealType(e.target.value)
              }
              disabled={aiLoading}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {MEAL_TYPES.map(
                ({ key, label }) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <textarea
            value={mealText}
            onChange={(e) =>
              setMealText(e.target.value)
            }
            maxLength={1000}
            rows={4}
            placeholder="Example: 2 rotis, paneer curry and a bowl of curd"
            className="w-full mt-5 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={aiLoading}
          />

          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>
              AI values are estimates.
            </span>

            <span>
              {mealText.length}/1000
            </span>
          </div>

          <button
            onClick={addMealWithAI}
            disabled={aiLoading}
            className="mt-5 w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition"
          >
            {aiLoading
              ? "Analyzing..."
              : "Analyze & Add Meal"}
          </button>
        </div>

        {/* Manual Meals */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Manual Calorie Entry
          </h2>

          <p className="text-gray-600 mt-2">
            Set the calorie value for a meal manually.
          </p>

          <div className="mt-6 space-y-4">
            {MEAL_TYPES.map(
              ({ key, label }) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row gap-3 sm:items-center"
                >
                  <label className="sm:w-40 font-semibold text-gray-700">
                    {label}
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    value={
                      manualCalories[key]
                    }
                    onChange={(e) =>
                      setManualCalories(
                        (prev) => ({
                          ...prev,
                          [key]:
                            e.target.value,
                        })
                      )
                    }
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={
                      manualLoading[key]
                    }
                  />

                  <button
                    onClick={() =>
                      updateManualCalories(
                        key
                      )
                    }
                    disabled={
                      manualLoading[key]
                    }
                    className="px-5 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-xl"
                  >
                    {manualLoading[key]
                      ? "Saving..."
                      : "Save"}
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Water */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Water Intake
          </h2>

          <p className="text-gray-600 mt-2">
            Track your total water intake for today.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              min="0"
              max="20000"
              step="50"
              value={water}
              onChange={(e) =>
                setWater(e.target.value)
              }
              placeholder="Water in ml"
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={waterLoading}
            />

            <button
              onClick={updateWater}
              disabled={waterLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl"
            >
              {waterLoading
                ? "Saving..."
                : "Save Water"}
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Today's total:{" "}
            <span className="font-semibold">
              {Math.round(
                toSafeNumber(
                  data?.waterIntake
                )
              )}{" "}
              ml
            </span>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-sm text-gray-500 text-center pb-8">
          Nutrition and calorie values generated by AI
          are estimates for informational purposes only.
          They should not replace professional dietary or
          medical advice.
        </p>
      </div>
    </div>
  );
}