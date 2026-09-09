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
  Sparkles,
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

import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

const MACRO_COLORS = {
  Protein: "#4F7345", // Forest Green
  Carbs: "#C1502E",   // Clay
  Fat: "#D67849",     // Warm Clay / Terracotta
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  rawNumber,
  suffix = "",
  sub,
  accent,
}) {
  return (
    <SpotlightCard
      className="p-5 shadow-sm border-cream-300 transition-all duration-200 hover:-translate-y-0.5"
      spotlightColor="rgba(79, 115, 69, 0.1)"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <p className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
        {rawNumber !== undefined ? (
          <>
            <CountUp to={rawNumber} duration={1.3} />
            {suffix && <span className="text-lg sm:text-xl font-medium text-ink-500 ml-1">{suffix}</span>}
          </>
        ) : (
          value
        )}
      </p>

      <p className="text-xs sm:text-sm font-semibold text-ink-700 mt-1">
        {label}
      </p>

      {sub && (
        <p className="text-[11px] sm:text-xs text-ink-400 mt-0.5 truncate">
          {sub}
        </p>
      )}
    </SpotlightCard>
  );
}

function ChartInsight({ text }) {
  if (!text) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-clay-200/80 bg-clay-50/80 p-4">
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-clay-600" />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-clay-700">
          AI interpretation
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-700">
          {text}
        </p>
      </div>
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

      setDashboard(res.data?.dashboard || null);
    } catch (err) {
      console.error(
        "Progress dashboard error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error || "Failed to load your progress."
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
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center bg-cream-50 p-8 rounded-2xl shadow-sm border border-cream-300">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600 mx-auto mb-3" />
          <p className="text-ink-600 font-medium text-sm">
            Compiling your nutritional trends...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-100 pt-28 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3 p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  const hasAnyData =
    dashboard &&
    (dashboard.mealsTracked > 0 || dashboard.today.calories > 0);

  const macroChartData = dashboard
    ? Object.entries(dashboard.macros)
        .filter(([key]) => key !== "fiber")
        .map(([key, value]) => ({
          name: key[0].toUpperCase() + key.slice(1),
          value: Math.round(value),
        }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-screen dietly-page-bg pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <FadeContent delay={0.05}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
                Your Progress & Analytics
              </h1>

              <p className="text-ink-600 text-sm sm:text-base mt-1">
                Real nutritional data and trends calculated from your daily logs.
              </p>
            </div>

            <div className="flex gap-1.5 bg-cream-50 p-1.5 rounded-2xl border border-cream-300 shadow-sm">
              {[7, 14, 30].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    days === d
                      ? "bg-forest-700 text-white shadow-sm"
                      : "text-ink-600 hover:text-forest-700 hover:bg-forest-50"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </FadeContent>

        {/* EMPTY STATE */}
        {!hasAnyData && (
          <FadeContent delay={0.1}>
            <div className="mb-8 text-center py-16 bg-cream-50 rounded-2xl border border-dashed border-cream-300">
              <Utensils className="w-10 h-10 text-ink-400 mx-auto mb-3" />

              <p className="text-ink-700 font-semibold text-lg">
                No tracked data yet in this date range.
              </p>

              <p className="text-ink-400 text-sm mt-1 max-w-sm mx-auto">
                Log a meal on the Analyze page or save your calories on the Calories page to generate interactive charts.
              </p>
            </div>
          </FadeContent>
        )}

        {dashboard && (
          <>
            {/* TOP STAT CARDS */}
            <FadeContent delay={0.1}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <StatCard
                  icon={Flame}
                  label="Today's Intake"
                  rawNumber={dashboard.today.calories}
                  suffix="kcal"
                  sub={`Goal: ${dashboard.today.goal} kcal • ${dashboard.today.remaining} left`}
                  accent="bg-forest-100 text-forest-700"
                />

                <StatCard
                  icon={TrendingUp}
                  label="Daily Average"
                  rawNumber={dashboard.averageCalories}
                  suffix="kcal"
                  sub={`Over ${dashboard.rangeDays} tracked days`}
                  accent="bg-clay-100 text-clay-700"
                />

                <StatCard
                  icon={Utensils}
                  label="Meals Tracked"
                  rawNumber={dashboard.mealsTracked}
                  sub={`In the last ${dashboard.rangeDays} days`}
                  accent="bg-amber-100 text-amber-700"
                />

                <StatCard
                  icon={Trophy}
                  label="Current Streak"
                  rawNumber={dashboard.streak.current}
                  suffix={dashboard.streak.current === 1 ? "day" : "days"}
                  sub={`Best streak: ${dashboard.streak.longest} day${
                    dashboard.streak.longest === 1 ? "" : "s"
                  }`}
                  accent="bg-forest-100 text-forest-800"
                />
              </div>
            </FadeContent>

            {dashboard.insights?.overall && (
              <FadeContent delay={0.15}>
                <SpotlightCard
                  className="mb-6 p-5 sm:p-6 border-clay-200 bg-cream-50/90 shadow-sm"
                  spotlightColor="rgba(193, 80, 46, 0.1)"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-clay-100 text-clay-600 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-lg text-ink-900">
                        Progress Summary & Trends
                      </p>
                      <p className="mt-1 leading-relaxed text-sm sm:text-base text-ink-600">
                        {dashboard.insights.overall}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </FadeContent>
            )}

            {dashboard.insightsStatus === "unavailable" && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-800">
                Charts are available, but AI interpretations are currently preparing.
              </div>
            )}

            {/* CALORIES TREND + GOAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FadeContent delay={0.15}>
                <SpotlightCard
                  className="p-6 border-cream-300 shadow-sm"
                  spotlightColor="rgba(79, 115, 69, 0.1)"
                >
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                    {dashboard.rangeDays}-Day Caloric Trend
                  </h3>

                  {dashboard.caloriesTrend.some((d) => d.calories > 0) ? (
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dashboard.caloriesTrend.map((d) => ({
                            ...d,
                            label: formatShortDate(d.date),
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                          <XAxis
                            dataKey="label"
                            interval={days === 30 ? 4 : days === 14 ? 1 : 0}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                          />
                          <YAxis
                            width={55}
                            tickFormatter={(value) => formatNumber(value)}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                            label={{ value: "kcal", angle: -90, position: "insideLeft", fill: "#7A756C" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAF7F2",
                              borderColor: "#E8DFD0",
                              borderRadius: "12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            }}
                            formatter={(value, name) => [`${formatNumber(value)} kcal`, name]}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="calories"
                            name="Consumed"
                            stroke="#4F7345"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#4F7345" }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="goal"
                            name="Goal Target"
                            stroke="#C1502E"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-ink-400 text-sm py-16 text-center">
                      No calorie data recorded in this range yet.
                    </p>
                  )}

                  <ChartInsight text={dashboard.insights?.calorieTrend} />
                </SpotlightCard>
              </FadeContent>

              <FadeContent delay={0.2}>
                <SpotlightCard
                  className="p-6 border-cream-300 shadow-sm"
                  spotlightColor="rgba(193, 80, 46, 0.1)"
                >
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                    Daily Goal vs Consumed
                  </h3>

                  {dashboard.caloriesTrend.some((d) => d.calories > 0) ? (
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboard.caloriesTrend.map((d) => ({
                            ...d,
                            label: formatShortDate(d.date),
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                          <XAxis
                            dataKey="label"
                            interval={days === 30 ? 4 : days === 14 ? 1 : 0}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                          />
                          <YAxis
                            width={55}
                            tickFormatter={(value) => formatNumber(value)}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                            label={{ value: "kcal", angle: -90, position: "insideLeft", fill: "#7A756C" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAF7F2",
                              borderColor: "#E8DFD0",
                              borderRadius: "12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            }}
                            formatter={(value, name) => [`${formatNumber(value)} kcal`, name]}
                          />
                          <Legend />
                          <Bar
                            dataKey="calories"
                            name="Consumed"
                            fill="#4F7345"
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            dataKey="goal"
                            name="Goal"
                            fill="#E8DFD0"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-ink-400 text-sm py-16 text-center">
                      No calorie data recorded in this range yet.
                    </p>
                  )}

                  <ChartInsight text={dashboard.insights?.goalComparison} />
                </SpotlightCard>
              </FadeContent>
            </div>

            {/* MACROS + WATER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FadeContent delay={0.2}>
                <SpotlightCard
                  className="p-6 border-cream-300 shadow-sm"
                  spotlightColor="rgba(79, 115, 69, 0.1)"
                >
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                    Macro Distribution{" "}
                    <span className="text-xs font-normal text-ink-500">
                      (protein, carbs, fat in grams)
                    </span>
                  </h3>

                  {macroChartData.length > 0 ? (
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macroChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {macroChartData.map((entry, i) => (
                              <Cell
                                key={i}
                                fill={MACRO_COLORS[entry.name] || "#4F7345"}
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAF7F2",
                              borderColor: "#E8DFD0",
                              borderRadius: "12px",
                            }}
                            formatter={(value, name) => [`${formatNumber(value)} g`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-ink-400 text-sm py-16 text-center">
                      No macronutrient records yet — log meals to view distribution.
                    </p>
                  )}

                  {dashboard.macros.fiber > 0 && (
                    <p className="mt-2 text-center text-xs text-ink-500">
                      Fiber total: {formatNumber(Math.round(dashboard.macros.fiber))} g
                    </p>
                  )}

                  <ChartInsight text={dashboard.insights?.macroDistribution} />
                </SpotlightCard>
              </FadeContent>

              <FadeContent delay={0.25}>
                <SpotlightCard
                  className="p-6 border-cream-300 shadow-sm"
                  spotlightColor="rgba(79, 115, 69, 0.12)"
                >
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-teal-600" />
                    <span>Water Intake Trend</span>
                  </h3>

                  {dashboard.waterTrend.some((d) => d.water > 0) ? (
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboard.waterTrend.map((d) => ({
                            ...d,
                            label: formatShortDate(d.date),
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                          <XAxis
                            dataKey="label"
                            interval={days === 30 ? 4 : days === 14 ? 1 : 0}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                          />
                          <YAxis
                            width={55}
                            tickFormatter={(value) => formatNumber(value)}
                            tick={{ fill: "#5F5B53", fontSize: 12 }}
                            label={{ value: "ml", angle: -90, position: "insideLeft", fill: "#7A756C" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAF7F2",
                              borderColor: "#E8DFD0",
                              borderRadius: "12px",
                            }}
                            formatter={(value) => [`${formatNumber(value)} ml`, "Water"]}
                          />
                          <Bar
                            dataKey="water"
                            name="Water (ml)"
                            fill="#3A5A32"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-ink-400 text-sm py-16 text-center">
                      No water intake logged yet — record it on the Calories page.
                    </p>
                  )}

                  <ChartInsight text={dashboard.insights?.waterTrend} />
                </SpotlightCard>
              </FadeContent>
            </div>

            {/* RECENT MEALS */}
            <FadeContent delay={0.25}>
              <SpotlightCard
                className="p-6 border-cream-300 shadow-sm"
                spotlightColor="rgba(79, 115, 69, 0.08)"
              >
                <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                  Recent Logged Meals
                </h3>

                {dashboard.recentMeals.length === 0 ? (
                  <p className="text-ink-400 text-sm py-8 text-center">
                    No meals logged in this range yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.recentMeals.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-cream-200/80 bg-cream-100/50 hover:bg-cream-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-ink-800 text-sm">
                            {m.name}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5">
                            {formatShortDate(m.date)}
                          </p>
                        </div>

                        <p className="text-sm font-bold text-forest-700">
                          {m.calories} <span className="text-xs font-normal text-ink-500">kcal</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SpotlightCard>
            </FadeContent>
          </>
        )}
      </div>
    </div>
  );
}
