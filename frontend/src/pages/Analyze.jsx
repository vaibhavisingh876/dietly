import React, { useState } from "react";
import MealForm from "../components/MealForm.jsx";
import api from "../api/api";

import {
  Zap,
  Trophy,
  XCircle,
  Loader2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BAR_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#e11d48",
  "#facc15",
  "#8b5cf6",
];

const PIE_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
];

const MAX_MEAL_LENGTH = 1000;

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (mealText) => {
    const cleanedText = String(mealText || "").trim();

    if (!cleanedText) {
      setError("Please describe your meal first.");
      return;
    }

    if (cleanedText.length > MAX_MEAL_LENGTH) {
      setError(
        `Meal description must be ${MAX_MEAL_LENGTH} characters or less.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post("/meals/analyze", {
        text: cleanedText,
      });

      if (!response.data?.data) {
        throw new Error("Invalid response from server.");
      }

      setResult(response.data.data);
    } catch (err) {
      console.error(
        "Meal analysis error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
          "Unable to analyze this meal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const barData =
    result?.macros
      ?.filter(
        (macro) =>
          macro &&
          typeof macro.name === "string"
      )
      .map((macro) => ({
        name: macro.name,
        value: Number.parseFloat(macro.value) || 0,
      })) || [];

  const pieData =
    result?.macros
      ?.filter((macro) =>
        ["Protein", "Fat", "Carbs"].includes(
          macro?.name
        )
      )
      .map((macro) => ({
        name: macro.name,
        value: Number.parseFloat(macro.value) || 0,
      })) || [];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center pt-8">
          <h1 className="text-5xl font-extrabold text-gray-900">
            AI Meal Analyzer
          </h1>

          <p className="text-center text-xl text-gray-600 font-medium mt-4">
            Log your meal, get instant nutritional insights,
            and track your health progress.
          </p>
        </div>

        {/* Meal Form */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-4 border-green-600">
          <MealForm
            onSubmit={analyze}
            loading={loading}
          />

          {error && (
            <div className="mt-6 p-4 text-red-700 bg-red-100 rounded-xl flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center p-12 text-xl font-medium text-green-700 bg-white rounded-3xl shadow-xl border border-green-200">
            <Loader2 className="w-10 h-10 text-green-600 mx-auto mb-4 animate-spin" />

            Generating AI nutrition report...
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="bg-white rounded-3xl shadow-2xl border-t-8 border-emerald-600 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-emerald-50 flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-3xl font-extrabold text-emerald-800 flex items-center gap-3">
                <Zap className="w-8 h-8 fill-emerald-600 text-white" />

                AI Nutrition Report
              </h2>

              <div className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-lg shadow-xl">
                <Trophy className="w-5 h-5 fill-current" />

                Meal analyzed
              </div>
            </div>

            <div className="p-8 space-y-12">
              {/* Summary */}
              {result.summary && (
                <div className="bg-green-100/70 p-6 rounded-2xl border border-green-200 shadow-inner">
                  <p className="text-gray-700 text-xl leading-relaxed italic">
                    <span className="font-extrabold text-green-800 mr-2 not-italic">
                      AI Summary:
                    </span>

                    "{result.summary}"
                  </p>
                </div>
              )}

              {/* Nutritional Breakdown */}
              {barData.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                    Nutritional Breakdown
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />

                      <Bar dataKey="value">
                        {barData.map(
                          (entry, index) => (
                            <Cell
                              key={`${entry.name}-${index}`}
                              fill={
                                BAR_COLORS[
                                  index %
                                    BAR_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Macronutrient Pie Chart */}
              {pieData.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                    Macronutrient Proportion
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {pieData.map(
                          (entry, index) => (
                            <Cell
                              key={`${entry.name}-${index}`}
                              fill={
                                PIE_COLORS[
                                  index %
                                    PIE_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Feedback */}
              {Array.isArray(result.feedback) &&
                result.feedback.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                      Personalized Feedback
                    </h3>

                    <div className="space-y-3">
                      {result.feedback.map(
                        (item, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border ${
                              item.type === "positive"
                                ? "bg-green-50 border-green-200 text-green-800"
                                : item.type === "warning"
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-gray-50 border-gray-200 text-gray-800"
                            }`}
                          >
                            {item.text}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="px-8 pb-8">
              <p className="text-sm text-gray-500 text-center">
                AI-generated nutrition estimates are for
                informational purposes only and should not
                replace professional medical or dietary advice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}