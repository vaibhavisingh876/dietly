import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Flame,
  Droplets,
  Target,
  Sparkles,
  Utensils,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import api from "../api/api";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "eveningSnack", label: "Evening Snack" },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mealText, setMealText] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [aiLoading, setAiLoading] = useState(false);
  const [manualCalories, setManualCalories] = useState(getInitialMeals());
  const [manualLoading, setManualLoading] = useState({});
  const [water, setWater] = useState("");
  const [waterLoading, setWaterLoading] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  /* ===================================================
     LOAD TODAY
  =================================================== */
  const loadToday = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/calorie/today");
      const today = response.data?.entry;

      if (!today) {
        throw new Error("Invalid calorie data received.");
      }

      setData(today);

      setManualCalories({
        breakfast: toSafeNumber(today.meals?.breakfast),
        lunch: toSafeNumber(today.meals?.lunch),
        dinner: toSafeNumber(today.meals?.dinner),
        eveningSnack: toSafeNumber(today.meals?.eveningSnack),
      });

      setWater(String(toSafeNumber(today.waterIntake)));
    } catch (err) {
      console.error("Failed to load calorie data:", err);
      setError(
        err.response?.data?.error || "Unable to load today's calorie data."
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
    const text = mealText.trim();

    if (!text) {
      setError("Please describe what you ate.");
      return;
    }

    if (text.length > 1000) {
      setError("Meal description cannot exceed 1000 characters.");
      return;
    }

    setAiLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/calorie/add-meal-ai", {
        mealText: text,
        mealType: selectedMealType,
      });

      const updated = response.data?.entry;

      if (!updated) {
        throw new Error("Invalid response from server.");
      }

      setData(updated);

      setManualCalories({
        breakfast: toSafeNumber(updated.meals?.breakfast),
        lunch: toSafeNumber(updated.meals?.lunch),
        dinner: toSafeNumber(updated.meals?.dinner),
        eveningSnack: toSafeNumber(updated.meals?.eveningSnack),
      });

      setWater(String(toSafeNumber(updated.waterIntake)));
      setMealText("");
      setSuccess("Meal analyzed and added successfully.");
    } catch (err) {
      console.error("AI calorie error:", err);
      setError(
        err.response?.data?.error || "Unable to analyze this meal."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* ===================================================
     MANUAL CALORIES
  =================================================== */
  const updateManualCalories = async (mealType) => {
    const raw = manualCalories[mealType];

    if (raw === "" || raw === null || raw === undefined) {
      setError("Please enter a calorie value.");
      return;
    }

    const calories = Number(raw);

    if (!Number.isFinite(calories) || calories < 0 || calories > 10000) {
      setError("Calories must be between 0 and 10,000.");
      return;
    }

    setManualLoading((prev) => ({
      ...prev,
      [mealType]: true,
    }));

    setError("");
    setSuccess("");

    try {
      const response = await api.post("/calorie/set-meal-calories", {
        mealType,
        calories,
      });

      const updated = response.data?.entry;

      if (!updated) {
        throw new Error("Invalid response from server.");
      }

      setData(updated);

      setManualCalories({
        breakfast: toSafeNumber(updated.meals?.breakfast),
        lunch: toSafeNumber(updated.meals?.lunch),
        dinner: toSafeNumber(updated.meals?.dinner),
        eveningSnack: toSafeNumber(updated.meals?.eveningSnack),
      });

      setSuccess("Calories updated successfully.");
    } catch (err) {
      console.error("Manual calorie update error:", err);
      setError(
        err.response?.data?.error || "Unable to update calories."
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
    if (water === "" || water === null) {
      setError("Please enter your water intake.");
      return;
    }

    const amount = Number(water);

    if (!Number.isFinite(amount) || amount < 0 || amount > 20000) {
      setError("Water intake must be between 0 and 20,000 ml.");
      return;
    }

    setWaterLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/calorie/set-water", {
        amount,
      });

      const updated = response.data?.entry;

      if (!updated) {
        throw new Error("Invalid response from server.");
      }

      setData(updated);
      setWater(String(toSafeNumber(updated.waterIntake)));
      setSuccess("Water intake updated successfully.");
    } catch (err) {
      console.error("Water update error:", err);
      setError(
        err.response?.data?.error || "Unable to update water intake."
      );
    } finally {
      setWaterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="bg-cream-50 rounded-2xl shadow-sm border border-cream-300 p-8 text-center">
          <Loader2 className="w-8 h-8 text-forest-600 animate-spin mx-auto mb-3" />
          <p className="text-ink-600 font-medium text-sm">
            Loading today's calories...
          </p>
        </div>
      </div>
    );
  }

  const goal = toSafeNumber(data?.dailyGoal, 2000);
  const total = toSafeNumber(data?.totalCalories);
  const remaining = Math.max(0, goal - total);
  const progress = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;

  return (
    <div className="min-h-screen dietly-page-bg px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <FadeContent delay={0.05}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-forest-100 text-forest-700">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
                  Today's Calories & Hydration
                </h1>
                <p className="text-ink-600 text-sm sm:text-base mt-0.5">
                  Track your daily caloric intake, log meals via AI, and manage hydration.
                </p>
              </div>
            </div>
          </div>
        </FadeContent>

        {/* Notifications */}
        {error && (
          <FadeContent delay={0.05}>
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-sm text-sm font-medium">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          </FadeContent>
        )}

        {success && (
          <FadeContent delay={0.05}>
            <div className="flex items-start gap-3 bg-forest-50 border border-forest-200 text-forest-800 rounded-2xl p-4 shadow-sm text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{success}</p>
            </div>
          </FadeContent>
        )}

        {/* Summary Card */}
        <FadeContent delay={0.1}>
          <SpotlightCard
            className="p-6 sm:p-8 shadow-sm border-cream-300"
            spotlightColor="rgba(79, 115, 69, 0.12)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              <div className="bg-cream-100/70 rounded-xl p-4 border border-cream-200/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Consumed Today
                </p>
                <p className="text-3xl font-bold text-ink-900 mt-1">
                  <CountUp to={Math.round(total)} duration={1.2} />{" "}
                  <span className="text-sm font-normal text-ink-500">kcal</span>
                </p>
              </div>

              <div className="bg-cream-100/70 rounded-xl p-4 border border-cream-200/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Daily Calorie Target
                </p>
                <p className="text-3xl font-bold text-forest-700 mt-1">
                  <CountUp to={Math.round(goal)} duration={1.2} />{" "}
                  <span className="text-sm font-normal text-ink-500">kcal</span>
                </p>
              </div>

              <div className="bg-cream-100/70 rounded-xl p-4 border border-cream-200/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Remaining
                </p>
                <p className="text-3xl font-bold text-clay-600 mt-1">
                  <CountUp to={Math.round(remaining)} duration={1.2} />{" "}
                  <span className="text-sm font-normal text-ink-500">kcal</span>
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-7">
              <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
                <span className="font-semibold text-ink-700">
                  Goal Completion
                </span>
                <span className="font-bold text-forest-700">
                  <CountUp to={Math.round(progress)} duration={1.2} />%
                </span>
              </div>

              <div className="h-3.5 bg-cream-200 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={prefersReducedMotion ? false : { width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    progress > 100 ? "bg-clay-500" : "bg-forest-600"
                  }`}
                />
              </div>
            </div>
          </SpotlightCard>
        </FadeContent>

        {/* AI Meal Entry */}
        <FadeContent delay={0.15}>
          <SpotlightCard
            className="p-6 sm:p-8 shadow-sm border-cream-300"
            spotlightColor="rgba(193, 80, 46, 0.1)"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles className="w-5 h-5 text-clay-500" />
              <h2 className="font-display text-2xl font-bold text-ink-900">
                Quick AI Meal Logger
              </h2>
            </div>

            <p className="text-ink-600 text-sm sm:text-base">
              Describe what you ate in natural language, and AI will estimate and add the calories to today's log.
            </p>

            {/* Meal Type Select */}
            <div className="mt-5">
              <label
                htmlFor="ai-meal-type"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-2"
              >
                Meal Category
              </label>

              <select
                id="ai-meal-type"
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                disabled={aiLoading}
                className="w-full sm:w-64 p-3 border border-cream-300 rounded-xl focus:border-forest-500 focus:ring-2 focus:ring-forest-100 bg-cream-100 text-ink-900 text-sm font-medium outline-none transition-colors"
              >
                {MEAL_TYPES.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="e.g. 2 whole eggs scrambled with spinach, 1 slice sourdough with butter, and an orange"
              className="w-full mt-4 p-4 border border-cream-300 rounded-xl resize-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-ink-900 text-sm outline-none bg-cream-100/50 transition-colors"
              disabled={aiLoading}
            />

            <div className="flex justify-between items-center mt-2 text-xs text-ink-400">
              <span>Natural AI estimation</span>
              <span>{mealText.length}/1000</span>
            </div>

            <button
              type="button"
              onClick={addMealWithAI}
              disabled={aiLoading}
              className="mt-4 w-full sm:w-auto px-6 py-3 bg-forest-700 hover:bg-forest-800 disabled:bg-forest-300 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Logging...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Analyze & Add to Today</span>
                </>
              )}
            </button>
          </SpotlightCard>
        </FadeContent>

        {/* Manual Calorie Adjustments */}
        <FadeContent delay={0.2}>
          <SpotlightCard
            className="p-6 sm:p-8 shadow-sm border-cream-300"
            spotlightColor="rgba(79, 115, 69, 0.1)"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Utensils className="w-5 h-5 text-forest-600" />
              <h2 className="font-display text-2xl font-bold text-ink-900">
                Manual Meal Breakdown
              </h2>
            </div>

            <p className="text-ink-600 text-sm">
              Adjust or manually override calorie totals for individual meals.
            </p>

            <div className="mt-6 space-y-3.5">
              {MEAL_TYPES.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row gap-3 sm:items-center bg-cream-100/60 p-3.5 rounded-xl border border-cream-200/80"
                >
                  <label className="sm:w-36 font-semibold text-sm text-ink-800">
                    {label}
                  </label>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="1"
                      value={manualCalories[key]}
                      onChange={(e) =>
                        setManualCalories((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full p-2.5 pr-14 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-forest-500 bg-cream-50"
                      disabled={manualLoading[key]}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">
                      kcal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateManualCalories(key)}
                    disabled={manualLoading[key]}
                    className="px-5 py-2.5 bg-ink-800 hover:bg-ink-900 disabled:bg-ink-400 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
                  >
                    {manualLoading[key] ? "Saving..." : "Save"}
                  </button>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </FadeContent>

        {/* Water Intake */}
        <FadeContent delay={0.25}>
          <SpotlightCard
            className="p-6 sm:p-8 shadow-sm border-cream-300"
            spotlightColor="rgba(79, 115, 69, 0.12)"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Droplets className="w-5 h-5 text-teal-600" />
              <h2 className="font-display text-2xl font-bold text-ink-900">
                Hydration Tracker
              </h2>
            </div>

            <p className="text-ink-600 text-sm">
              Keep your daily water intake logged for optimal wellness and vitality.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="20000"
                  step="50"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  placeholder="Water in ml (e.g. 2000)"
                  className="w-full p-3 pr-14 border border-cream-300 rounded-xl focus:outline-none focus:border-forest-500 bg-cream-50 text-sm"
                  disabled={waterLoading}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400">
                  ml
                </span>
              </div>

              <button
                type="button"
                onClick={updateWater}
                disabled={waterLoading}
                className="px-6 py-3 bg-clay-500 hover:bg-clay-600 disabled:bg-clay-300 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
              >
                {waterLoading ? "Saving..." : "Save Hydration"}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-ink-600 bg-forest-50/70 p-3 rounded-xl border border-forest-100">
              <Droplets className="w-4 h-4 text-forest-600 shrink-0" />
              <p>
                Today's recorded total:{" "}
                <span className="font-bold text-forest-800">
                  <CountUp to={Math.round(toSafeNumber(data?.waterIntake))} duration={1} /> ml
                </span>
              </p>
            </div>
          </SpotlightCard>
        </FadeContent>

        {/* Disclaimer */}
        <p className="text-xs text-ink-400 text-center pb-6">
          Dietly provides estimated nutrition metrics for informational mindfulness only.
        </p>
      </div>
    </div>
  );
}
