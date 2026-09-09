import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Utensils,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import MealForm from "../components/MealForm.jsx";
import { api } from "../api/api";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

const MEAL_TYPES = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
  { value: "Snack", label: "Snack" },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeAnalysisResult(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const macroMap = Array.isArray(data.macros)
    ? data.macros.reduce((acc, item) => {
        if (!item || typeof item !== "object") {
          return acc;
        }

        const key = String(item.name || "")
          .trim()
          .toLowerCase();

        if (key) {
          acc[key] = toNumber(
            item.value ?? item.amount ?? 0
          );
        }

        return acc;
      }, {})
    : {};

  return {
    ...data,
    calories: toNumber(data.calories ?? macroMap.calories),
    protein: toNumber(data.protein ?? macroMap.protein),
    carbs: toNumber(data.carbs ?? macroMap.carbs),
    fat: toNumber(data.fat ?? macroMap.fat),
    fiber: toNumber(data.fiber ?? macroMap.fiber),
  };
}

export default function Analyze() {
  const navigate = useNavigate();

  const [mealType, setMealType] = useState("Lunch");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (mealText) => {
    const text =
      typeof mealText === "string"
        ? mealText.trim()
        : "";

    if (!text) {
      setError("Please enter what you ate.");
      return;
    }

    if (text.length > 1000) {
      setError("Meal description cannot exceed 1000 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post("/meals/analyze", {
        text,
        mealType,
      });

      const data = response?.data?.data;

      if (!data) {
        throw new Error("Invalid response from server.");
      }

      const normalizedResult = normalizeAnalysisResult(data);

      if (!normalizedResult) {
        throw new Error("Invalid nutrition data from server.");
      }

      setResult(normalizedResult);
    } catch (err) {
      console.error("Meal analysis error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to analyze your meal right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const nutritionData = result
    ? [
        {
          name: "Protein",
          value: toNumber(result.protein),
          color: "#4F7345", // Forest 500
        },
        {
          name: "Carbs",
          value: toNumber(result.carbs),
          color: "#C1502E", // Clay 500
        },
        {
          name: "Fat",
          value: toNumber(result.fat),
          color: "#D67849", // Clay 400
        },
        {
          name: "Fiber",
          value: toNumber(result.fiber),
          color: "#719467", // Forest 400
        },
      ]
    : [];

  return (
    <div className="min-h-screen dietly-page-bg px-4 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeContent delay={0.05}>
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-clay-100 border border-clay-200/60 shadow-sm">
                <Sparkles className="w-7 h-7 text-clay-600" />
              </div>

              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
                  AI Meal Analyzer
                </h1>

                <p className="text-ink-600 mt-1 text-sm sm:text-base">
                  Describe what you ate in natural language and receive an instant, personalized nutritional estimate.
                </p>
              </div>
            </div>
          </div>
        </FadeContent>

        {/* Error Alert */}
        {error && (
          <FadeContent delay={0.05}>
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-700 shadow-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </FadeContent>
        )}

        {/* Main Input Card */}
        <SpotlightCard
          className="p-6 sm:p-8 shadow-sm border-cream-300"
          spotlightColor="rgba(79, 115, 69, 0.12)"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-clay-600" />
              <label
                htmlFor="meal-type"
                className="font-semibold text-ink-900 text-sm sm:text-base"
              >
                Meal Category
              </label>
            </div>

            <select
              id="meal-type"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              disabled={loading}
              className="w-full sm:w-56 rounded-xl border border-cream-300 px-3.5 py-2.5 bg-cream-100 text-ink-900 text-sm font-medium outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 disabled:opacity-60 transition-colors"
            >
              {MEAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <MealForm onSubmit={handleAnalyze} loading={loading} />
          </div>
        </SpotlightCard>

        {/* Loading Indicator */}
        {loading && (
          <FadeContent delay={0.1}>
            <div className="mt-8 bg-cream-50/90 rounded-2xl shadow-sm border border-cream-300 p-12 text-center">
              <div className="inline-flex p-3 rounded-full bg-forest-50 border border-forest-100 mb-3">
                <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
              </div>

              <h2 className="font-display text-xl font-semibold text-ink-900">
                Analyzing your meal...
              </h2>

              <p className="mt-1.5 text-sm text-ink-500 max-w-sm mx-auto">
                Consulting nutrition knowledge base to estimate calories, macros, and dietary insights.
              </p>
            </div>
          </FadeContent>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div className="mt-8 space-y-6">
            {/* Complete Header & Summary */}
            <FadeContent delay={0.05}>
              <SpotlightCard
                className="p-6 sm:p-7 border-cream-300 shadow-sm"
                spotlightColor="rgba(79, 115, 69, 0.15)"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-forest-100 text-forest-700 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-bold text-ink-900">
                      Analysis Complete
                    </h2>

                    <div className="inline-flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800">
                        {mealType}
                      </span>
                    </div>
                  </div>
                </div>

                {result.summary && (
                  <p className="mt-5 text-ink-700 leading-relaxed text-sm sm:text-base border-t border-cream-200 pt-4">
                    {result.summary}
                  </p>
                )}
              </SpotlightCard>
            </FadeContent>

            {/* Nutrition Breakdown Cards & Chart */}
            <FadeContent delay={0.15}>
              <SpotlightCard
                className="p-6 sm:p-8 border-cream-300 shadow-sm"
                spotlightColor="rgba(193, 80, 46, 0.1)"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-ink-900">
                    Nutritional Breakdown
                  </h2>
                  <span className="text-xs font-medium text-ink-500 bg-cream-100 px-3 py-1 rounded-full border border-cream-200">
                    Estimated values
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
                  <NutritionCard
                    label="Calories"
                    value={result.calories}
                    unit="kcal"
                    accentColor="text-forest-700"
                  />
                  <NutritionCard
                    label="Protein"
                    value={result.protein}
                    unit="g"
                    accentColor="text-forest-600"
                  />
                  <NutritionCard
                    label="Carbs"
                    value={result.carbs}
                    unit="g"
                    accentColor="text-clay-600"
                  />
                  <NutritionCard
                    label="Fat"
                    value={result.fat}
                    unit="g"
                    accentColor="text-clay-500"
                  />
                  <NutritionCard
                    label="Fiber"
                    value={result.fiber}
                    unit="g"
                    accentColor="text-forest-500"
                  />
                </div>

                {nutritionData.length > 0 && (
                  <div className="border-t border-cream-200 pt-6">
                    <h3 className="mb-4 font-display text-sm font-semibold text-ink-700 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-forest-600" />
                      <span>Macronutrient distribution (grams)</span>
                    </h3>
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={nutritionData}
                          margin={{
                            top: 10,
                            right: 15,
                            left: 0,
                            bottom: 10,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#5F5B53", fontSize: 13 }}
                          />
                          <YAxis
                            width={48}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                            label={{
                              value: "grams",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#7A756C",
                              fontSize: 12,
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAF7F2",
                              borderColor: "#E8DFD0",
                              borderRadius: "12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            }}
                            formatter={(value, name) => [
                              `${Math.round(toNumber(value) * 10) / 10} g`,
                              name === "value" ? "Amount" : name,
                            ]}
                          />
                          <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
                            {nutritionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </SpotlightCard>
            </FadeContent>

            {/* AI Feedback */}
            {Array.isArray(result.feedback) && result.feedback.length > 0 && (
              <FadeContent delay={0.2}>
                <SpotlightCard
                  className="p-6 sm:p-7 border-cream-300 shadow-sm"
                  spotlightColor="rgba(79, 115, 69, 0.1)"
                >
                  <h2 className="font-display text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-clay-500" />
                    <span>Personalized Insights</span>
                  </h2>

                  <div className="space-y-3">
                    {result.feedback.map((item, index) => (
                      <div
                        key={`${item.text}-${index}`}
                        className={`rounded-xl p-4 text-sm leading-relaxed border transition-colors ${
                          item.type === "positive"
                            ? "bg-forest-50 border-forest-200 text-forest-800"
                            : item.type === "warning"
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : "bg-cream-100 border-cream-200 text-ink-700"
                        }`}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </FadeContent>
            )}

            {/* Disclaimer */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
              <span className="shrink-0 font-bold">ℹ</span>
              <p>
                Dietly nutrition numbers are AI-based approximations designed for habit tracking and general mindfulness. They should not replace clinical medical advice.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/history")}
                className="flex-1 rounded-xl bg-forest-700 hover:bg-forest-800 text-white py-3.5 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <span>View Meal History</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
                className="flex-1 rounded-xl border border-cream-300 bg-cream-50 hover:bg-cream-100 text-ink-700 py-3.5 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Analyze Another Meal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NutritionCard({ label, value, unit, accentColor = "text-ink-900" }) {
  const number = toNumber(value);

  return (
    <div className="rounded-xl bg-cream-100/90 border border-cream-300/80 p-3.5 sm:p-4 text-center transition-all duration-200 hover:border-forest-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>

      <p className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight ${accentColor}`}>
        <CountUp to={Math.round(number * 10) / 10} decimals={number % 1 !== 0 ? 1 : 0} duration={1.2} />
      </p>

      <p className="text-xs text-ink-400 font-medium mt-0.5">{unit}</p>
    </div>
  );
}
