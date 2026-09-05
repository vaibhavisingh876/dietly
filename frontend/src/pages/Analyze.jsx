import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Utensils,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import MealForm from "../components/MealForm.jsx";
import { api } from "../api/api";

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

    calories: toNumber(
      data.calories ?? macroMap.calories
    ),

    protein: toNumber(
      data.protein ?? macroMap.protein
    ),

    carbs: toNumber(
      data.carbs ?? macroMap.carbs
    ),

    fat: toNumber(
      data.fat ?? macroMap.fat
    ),

    fiber: toNumber(
      data.fiber ?? macroMap.fiber
    ),
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
      setError(
        "Meal description cannot exceed 1000 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/meals/analyze",
        {
          text,
          mealType,
        }
      );

      const data = response?.data?.data;

      if (!data) {
        throw new Error(
          "Invalid response from server."
        );
      }

      const normalizedResult =
        normalizeAnalysisResult(data);

      if (!normalizedResult) {
        throw new Error(
          "Invalid nutrition data from server."
        );
      }

      setResult(normalizedResult);
    } catch (err) {
      console.error(
        "Meal analysis error:",
        err
      );

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
        },
        {
          name: "Carbs",
          value: toNumber(result.carbs),
        },
        {
          name: "Fat",
          value: toNumber(result.fat),
        },
        {
          name: "Fiber",
          value: toNumber(result.fiber),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-green-50 px-4 pt-28 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100">
              <Sparkles className="w-7 h-7 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                AI Meal Analyzer
              </h1>

              <p className="text-slate-600 mt-1">
                Describe your meal and get an
                AI-powered nutrition estimate.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-indigo-600" />

            <label
              htmlFor="meal-type"
              className="font-semibold text-slate-900"
            >
              Meal Type
            </label>
          </div>

          <select
            id="meal-type"
            value={mealType}
            onChange={(e) =>
              setMealType(e.target.value)
            }
            disabled={loading}
            className="w-full sm:w-64 rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {MEAL_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>

          <div className="mt-5">
            <MealForm
              onSubmit={handleAnalyze}
              loading={loading}
            />
          </div>
        </div>

        {loading && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border p-10 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Analyzing your meal...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              This may take a few seconds.
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Analysis Complete
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {mealType}
                  </p>
                </div>
              </div>

              {result.summary && (
                <p className="mt-5 text-slate-700 leading-7">
                  {result.summary}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-5">
                Nutrition Breakdown
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <NutritionCard
                  label="Calories"
                  value={result.calories}
                  unit="kcal"
                />

                <NutritionCard
                  label="Protein"
                  value={result.protein}
                  unit="g"
                />

                <NutritionCard
                  label="Carbs"
                  value={result.carbs}
                  unit="g"
                />

                <NutritionCard
                  label="Fat"
                  value={result.fat}
                  unit="g"
                />

                <NutritionCard
                  label="Fiber"
                  value={result.fiber}
                  unit="g"
                />
              </div>

              {nutritionData.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Estimated nutrients in grams
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={nutritionData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 5,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis
                          width={48}
                          label={{
                            value: "grams",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />

                        <Tooltip
                          formatter={(value, name) => [
                            `${Math.round(toNumber(value) * 10) / 10} g`,
                            name === "value" ? "Amount" : name,
                          ]}
                        />

                        <Bar
                          dataKey="value"
                          name="Amount"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {Array.isArray(result.feedback) &&
              result.feedback.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    AI Feedback
                  </h2>

                  <div className="space-y-3">
                    {result.feedback.map(
                      (item, index) => (
                        <div
                          key={`${item.text}-${index}`}
                          className={`rounded-xl p-4 ${
                            item.type === "positive"
                              ? "bg-green-50 text-green-800"
                              : item.type === "warning"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {item.text}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              AI nutrition values are estimates and
              may not be exact. They should not be
              treated as medical or professional
              dietary advice.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/history")
                }
                className="flex-1 rounded-xl bg-indigo-600 text-white py-3 font-medium hover:bg-indigo-700"
              >
                View Meal History
              </button>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
                className="flex-1 rounded-xl border border-slate-300 bg-white text-slate-700 py-3 font-medium hover:bg-slate-50"
              >
                Analyze Another Meal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NutritionCard({
  label,
  value,
  unit,
}) {
  const number = toNumber(value);

  return (
    <div className="rounded-xl bg-slate-50 border p-4 text-center">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-1">
        {Math.round(number * 10) / 10}
      </p>

      <p className="text-xs text-slate-400">
        {unit}
      </p>
    </div>
  );
}
