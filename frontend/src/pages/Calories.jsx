import { useEffect, useState } from "react";
import api from "../api/api";

const mealTypes = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "eveningSnack", label: "Evening Snack" },
];

const emptyMeals = {
  breakfast: 0,
  lunch: 0,
  dinner: 0,
  eveningSnack: 0,
};

export default function Calories() {
  const [foodInput, setFoodInput] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [waterInput, setWaterInput] = useState("");

  const [dailyGoal, setDailyGoal] = useState(2000);

  const [meals, setMeals] = useState(emptyMeals);
  const [totalCalories, setTotalCalories] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);

  const [selectedMeal, setSelectedMeal] = useState("breakfast");

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [waterLoading, setWaterLoading] = useState(false);

  const [error, setError] = useState("");

  // -----------------------------------------
  // LOAD TODAY'S CALORIE DATA
  // -----------------------------------------
  const loadToday = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/calorie/today");

      const entry = response.data?.entry;

      if (entry) {
        setDailyGoal(entry.dailyGoal ?? 2000);

        setMeals({
          breakfast: entry.meals?.breakfast ?? 0,
          lunch: entry.meals?.lunch ?? 0,
          dinner: entry.meals?.dinner ?? 0,
          eveningSnack: entry.meals?.eveningSnack ?? 0,
        });

        setTotalCalories(entry.totalCalories ?? 0);
        setWaterIntake(entry.waterIntake ?? 0);
      }
    } catch (err) {
      console.error(
        "Error loading today's calories:",
        err.response?.data || err.message
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

  // -----------------------------------------
  // AI MEAL ADD
  // -----------------------------------------
  const addAICalories = async () => {
    if (!foodInput.trim()) return;

    try {
      setAiLoading(true);
      setError("");

      const response = await api.post("/calorie/add-meal-text", {
        mealType: selectedMeal,
        mealText: foodInput.trim(),
      });

      const entry = response.data?.entry;

      if (entry) {
        setMeals({
          breakfast: entry.meals?.breakfast ?? 0,
          lunch: entry.meals?.lunch ?? 0,
          dinner: entry.meals?.dinner ?? 0,
          eveningSnack: entry.meals?.eveningSnack ?? 0,
        });

        setTotalCalories(entry.totalCalories ?? 0);
        setWaterIntake(entry.waterIntake ?? 0);
      }

      setFoodInput("");
    } catch (err) {
      console.error(
        "AI calorie error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
          "Failed to analyze the meal. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // -----------------------------------------
  // MANUAL CALORIE SET
  // -----------------------------------------
  const addManualCalories = async () => {
    if (!manualInput.trim()) return;

    const value = parseInt(manualInput);

    if (isNaN(value) || value < 0) {
      setError("Please enter a valid non-negative calorie value.");
      return;
    }

    try {
      setManualLoading(true);
      setError("");

      const response = await api.post("/calorie/set-meal-calories", {
        mealType: selectedMeal,
        calories: value,
      });

      const entry = response.data?.entry;

      if (entry) {
        setMeals({
          breakfast: entry.meals?.breakfast ?? 0,
          lunch: entry.meals?.lunch ?? 0,
          dinner: entry.meals?.dinner ?? 0,
          eveningSnack: entry.meals?.eveningSnack ?? 0,
        });

        setTotalCalories(entry.totalCalories ?? 0);
        setWaterIntake(entry.waterIntake ?? 0);
      }

      setManualInput("");
    } catch (err) {
      console.error(
        "Manual calorie error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
          "Failed to update calories."
      );
    } finally {
      setManualLoading(false);
    }
  };

  // -----------------------------------------
  // ADD WATER
  // -----------------------------------------
  const addWater = async () => {
    if (!waterInput.trim()) return;

    const amount = parseInt(waterInput);

    if (isNaN(amount) || amount < 0) {
      setError("Please enter a valid water amount.");
      return;
    }

    try {
      setWaterLoading(true);
      setError("");

      const response = await api.post("/calorie/add-water", {
        amount,
      });

      const entry = response.data?.entry;

      if (entry) {
        setWaterIntake(entry.waterIntake ?? 0);

        setMeals({
          breakfast: entry.meals?.breakfast ?? 0,
          lunch: entry.meals?.lunch ?? 0,
          dinner: entry.meals?.dinner ?? 0,
          eveningSnack: entry.meals?.eveningSnack ?? 0,
        });

        setTotalCalories(entry.totalCalories ?? 0);
      }

      setWaterInput("");
    } catch (err) {
      console.error(
        "Water update error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
          "Failed to update water intake."
      );
    } finally {
      setWaterLoading(false);
    }
  };

  // -----------------------------------------
  // CALCULATIONS FOR DISPLAY ONLY
  // -----------------------------------------
  const remaining =
    dailyGoal > totalCalories
      ? dailyGoal - totalCalories
      : 0;

  const exceeded = totalCalories > dailyGoal;

  // -----------------------------------------
  // LOADING STATE
  // -----------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-lg font-semibold text-green-700">
          Loading today's calories...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-lg mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Calorie Tracker
        </h1>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* DAILY GOAL */}
        <div className="bg-white p-4 rounded-xl shadow w-full mb-4">
          <label className="font-semibold">
            Daily Calorie Goal:
          </label>

          <div className="mt-2 p-2 bg-gray-100 rounded">
            {dailyGoal} kcal
          </div>
        </div>

        {/* FOOD INPUT + AI */}
        <div className="bg-white p-4 rounded-xl shadow w-full mb-4">
          <label className="font-semibold">
            Enter Food / Meal:
          </label>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="e.g., Paneer tikka with 2 rotis"
              disabled={aiLoading}
            />

            <button
              type="button"
              onClick={addAICalories}
              disabled={aiLoading || !foodInput.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {aiLoading ? "Analyzing..." : "AI Add"}
            </button>
          </div>

          {/* MEAL SELECTION */}
          <div className="flex flex-wrap gap-2 mt-4">
            {mealTypes.map((meal) => (
              <button
                type="button"
                key={meal.key}
                onClick={() => setSelectedMeal(meal.key)}
                className={`px-3 py-2 rounded ${
                  selectedMeal === meal.key
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {meal.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Adding AI food to:{" "}
            <span className="font-semibold">
              {
                mealTypes.find(
                  (meal) => meal.key === selectedMeal
                )?.label
              }
            </span>
          </p>
        </div>

        {/* MANUAL CALORIES */}
        <div className="bg-white p-4 rounded-xl shadow w-full mb-4">
          <label className="font-semibold">
            Set Meal Calories Manually:
          </label>

          <div className="flex gap-2 mt-2">
            <input
              type="number"
              min="0"
              className="flex-1 p-2 border rounded"
              value={manualInput}
              onChange={(e) =>
                setManualInput(e.target.value)
              }
              placeholder="e.g., 350"
              disabled={manualLoading}
            />

            <button
              type="button"
              onClick={addManualCalories}
              disabled={manualLoading || !manualInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {manualLoading ? "Saving..." : "Set"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            This replaces the current calories for the selected
            meal.
          </p>
        </div>

        {/* MEAL CALORIE DISPLAY */}
        {mealTypes.map((meal) => (
          <div
            key={meal.key}
            className="bg-white p-4 rounded-xl shadow w-full mb-3 flex justify-between items-center"
          >
            <span className="font-semibold">
              {meal.label}: {meals[meal.key]} kcal
            </span>

            <button
              type="button"
              onClick={async () => {
                try {
                  setError("");

                  const response = await api.post(
                    "/calorie/set-meal-calories",
                    {
                      mealType: meal.key,
                      calories: 0,
                    }
                  );

                  const entry = response.data?.entry;

                  if (entry) {
                    setMeals({
                      breakfast:
                        entry.meals?.breakfast ?? 0,
                      lunch:
                        entry.meals?.lunch ?? 0,
                      dinner:
                        entry.meals?.dinner ?? 0,
                      eveningSnack:
                        entry.meals?.eveningSnack ?? 0,
                    });

                    setTotalCalories(
                      entry.totalCalories ?? 0
                    );
                  }
                } catch (err) {
                  console.error(
                    "Reset calorie error:",
                    err.response?.data || err.message
                  );

                  setError(
                    err.response?.data?.error ||
                      "Failed to reset calories."
                  );
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        ))}

        {/* TOTAL SUMMARY */}
        <div className="bg-white p-5 rounded-xl shadow w-full mt-4 text-center">
          <p className="text-lg font-bold">
            Total Intake:{" "}
            <span
              className={
                exceeded
                  ? "text-red-600"
                  : "text-green-700"
              }
            >
              {totalCalories} kcal
            </span>
          </p>

          <p className="mt-2 font-semibold">
            {exceeded ? (
              <span className="text-red-600">
                ⚠ Goal Exceeded!
              </span>
            ) : (
              `Remaining: ${remaining} kcal`
            )}
          </p>
        </div>

        {/* WATER TRACKING */}
        <div className="bg-white p-4 rounded-xl shadow w-full mt-4">
          <h2 className="font-bold text-lg mb-2">
            💧 Water Intake
          </h2>

          <p className="text-gray-600 mb-3">
            Current intake:{" "}
            <span className="font-semibold">
              {waterIntake}
            </span>
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="flex-1 p-2 border rounded"
              value={waterInput}
              onChange={(e) =>
                setWaterInput(e.target.value)
              }
              placeholder="Amount"
              disabled={waterLoading}
            />

            <button
              type="button"
              onClick={addWater}
              disabled={waterLoading || !waterInput.trim()}
              className="px-4 py-2 bg-cyan-600 text-white rounded disabled:opacity-50"
            >
              {waterLoading ? "Saving..." : "Update"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Enter the total water intake you want to record.
          </p>
        </div>

      </div>
    </div>
  );
}