// src/pages/Progress.jsx
//
// Real Progress Dashboard, backed entirely by GET /api/progress/dashboard.
// The backend derives the dashboard from persisted MealEntry + Meal
// documents.

import React, { useEffect, useState } from "react";
import api from "../api/api";

import {
  Flame,
  Droplets,
  Trophy,
  Utensils,
  Loader2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MACRO_COLORS = {
  Protein: "#3b82f6",
  Carbs: "#f97316",
  Fat: "#e11d48",
  Fiber: "#8b5cf6",
};

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);

  return new Date(y, m - 1, d).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      {sub && (
        <p className="text-xs text-gray-400 mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(7);

  const load = async (rangeDays) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/progress/dashboard?days=${rangeDays}`
      );

      setDashboard(
        res.data?.dashboard || null
      );
    } catch (err) {
      console.error(
        "Progress dashboard error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
          "Failed to load your progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />

          <p className="text-gray-500">
            Loading your progress...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />

          <span>{error}</span>
        </div>
      </div>
    );
  }

  const hasAnyData =
    dashboard &&
    (
      dashboard.mealsTracked > 0 ||
      dashboard.today.calories > 0
    );

  const macroChartData = dashboard
    ? Object.entries(dashboard.macros)
        .map(([key, value]) => ({
          name:
            key[0].toUpperCase() +
            key.slice(1),
          value: Math.round(value),
        }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Progress
            </h1>

            <p className="text-gray-500">
              Real data from your logged meals and
              calorie tracking.
            </p>
          </div>

          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  days === d
                    ? "bg-green-600 text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY STATE */}
        {!hasAnyData && (
          <div className="mb-8 text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
            <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-3" />

            <p className="text-gray-500">
              No tracked data yet in this range.
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Log a meal on the Analyze page or add
              calories on the Calories page to see your
              progress here.
            </p>
          </div>
        )}

        {dashboard && (
          <>
            {/* TOP STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Flame}
                label="Today's Calories"
                value={`${dashboard.today.calories} kcal`}
                sub={`Goal: ${dashboard.today.goal} kcal • ${dashboard.today.remaining} remaining`}
                accent="bg-green-100 text-green-600"
              />

              <StatCard
                icon={TrendingUp}
                label="Average Calories"
                value={`${dashboard.averageCalories} kcal`}
                sub="Over tracked days in this range"
                accent="bg-blue-100 text-blue-600"
              />

              <StatCard
                icon={Utensils}
                label="Meals Tracked"
                value={dashboard.mealsTracked}
                sub={`In the last ${dashboard.rangeDays} days`}
                accent="bg-amber-100 text-amber-600"
              />

              <StatCard
                icon={Trophy}
                label="Current Streak"
                value={`${dashboard.streak.current} day${
                  dashboard.streak.current === 1
                    ? ""
                    : "s"
                }`}
                sub={`Longest: ${dashboard.streak.longest} day${
                  dashboard.streak.longest === 1
                    ? ""
                    : "s"
                }`}
                accent="bg-purple-100 text-purple-600"
              />
            </div>

            {/* CALORIES TREND + GOAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {dashboard.rangeDays}-Day Calorie Trend
                </h3>

                {dashboard.caloriesTrend.some(
                  (d) => d.calories > 0
                ) ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <LineChart
                      data={dashboard.caloriesTrend.map(
                        (d) => ({
                          ...d,
                          label: formatShortDate(
                            d.date
                          ),
                        })
                      )}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />

                      <XAxis dataKey="label" />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="calories"
                        name="Consumed"
                        stroke="#22c55e"
                        strokeWidth={2}
                      />

                      <Line
                        type="monotone"
                        dataKey="goal"
                        name="Goal"
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm py-16 text-center">
                    No calorie data in this range yet.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Goal vs Consumed (per day)
                </h3>

                {dashboard.caloriesTrend.some(
                  (d) => d.calories > 0
                ) ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <BarChart
                      data={dashboard.caloriesTrend.map(
                        (d) => ({
                          ...d,
                          label: formatShortDate(
                            d.date
                          ),
                        })
                      )}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />

                      <XAxis dataKey="label" />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Bar
                        dataKey="calories"
                        name="Consumed"
                        fill="#22c55e"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="goal"
                        name="Goal"
                        fill="#cbd5e1"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm py-16 text-center">
                    No calorie data in this range yet.
                  </p>
                )}
              </div>
            </div>

            {/* MACROS + WATER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Macro Distribution{" "}
                  <span className="text-sm font-normal text-gray-400">
                    (grams, all tracked meals)
                  </span>
                </h3>

                {macroChartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <PieChart>
                      <Pie
                        data={macroChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {macroChartData.map(
                          (entry, i) => (
                            <Cell
                              key={i}
                              fill={
                                MACRO_COLORS[
                                  entry.name
                                ] ||
                                "#22c55e"
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Legend />

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm py-16 text-center">
                    No macro data yet — log a meal
                    via the Analyze page.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-500" />
                  Water Intake Trend
                </h3>

                {dashboard.waterTrend.some(
                  (d) => d.water > 0
                ) ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <BarChart
                      data={dashboard.waterTrend.map(
                        (d) => ({
                          ...d,
                          label: formatShortDate(
                            d.date
                          ),
                        })
                      )}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />

                      <XAxis dataKey="label" />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="water"
                        name="Water (ml)"
                        fill="#06b6d4"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm py-16 text-center">
                    No water intake logged yet —
                    track it on the Calories page.
                  </p>
                )}
              </div>
            </div>

            {/* RECENT MEALS */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Meals
              </h3>

              {dashboard.recentMeals.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">
                  No meals logged in this range yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboard.recentMeals.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {m.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {formatShortDate(m.date)}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600">
                        {m.calories} kcal
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}