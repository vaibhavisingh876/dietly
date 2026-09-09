import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  PenLine,
  ChevronLeft,
  CheckCircle,
  Flame,
  RefreshCw,
  Calendar,
  Utensils,
  ArrowRight,
} from "lucide-react";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

const FEEDBACK_STYLES = {
  positive: "text-forest-800 bg-forest-50 border-forest-200",
  warning: "text-amber-800 bg-amber-50 border-amber-200",
  neutral: "text-ink-700 bg-cream-100 border-cream-200",
};

function formatDate(dateStr) {
  if (!dateStr) return "";

  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) {
    return dateStr;
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(meals) {
  const groups = {};

  for (const meal of meals) {
    const key = meal.date || "Unknown date";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(meal);
  }

  return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

function MealDetail({ meal, onBack }) {
  return (
    <FadeContent delay={0.05}>
      <SpotlightCard
        className="p-6 sm:p-8 shadow-sm border-cream-300"
        spotlightColor="rgba(79, 115, 69, 0.12)"
      >
        {/* BACK */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-forest-700 mb-6 bg-cream-100 px-3 py-1.5 rounded-lg border border-cream-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Meal History</span>
        </button>

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6 pb-5 border-b border-cream-200">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              {meal.name}
            </h2>

            <p className="text-sm text-ink-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink-400" />
              <span>{formatDate(meal.date)}</span>
              {meal.mealType && <span>• {meal.mealType}</span>}
            </p>
          </div>

          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              meal.aiGenerated
                ? "bg-forest-100 text-forest-800"
                : "bg-clay-100 text-clay-800"
            }`}
          >
            {meal.aiGenerated ? (
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            ) : (
              <PenLine className="w-3.5 h-3.5 text-clay-600" />
            )}
            {meal.aiGenerated ? "AI-Analyzed" : "Manually Logged"}
          </span>
        </div>

        {/* SUMMARY */}
        {meal.summary && (
          <div className="text-ink-700 bg-forest-50/70 border border-forest-100 rounded-xl p-4 mb-6 text-sm sm:text-base leading-relaxed">
            "{meal.summary}"
          </div>
        )}

        {/* NUTRITION CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            ["Calories", meal.calories, "kcal", "text-forest-800"],
            ["Protein", meal.protein, "g", "text-forest-700"],
            ["Carbs", meal.carbs, "g", "text-clay-600"],
            ["Fat", meal.fat, "g", "text-clay-500"],
            ["Fiber", meal.fiber, "g", "text-forest-600"],
          ].map(([label, value, unit, colorClass]) => (
            <div
              key={label}
              className="bg-cream-100/80 rounded-xl p-3.5 text-center border border-cream-200/80"
            >
              <p className={`text-xl sm:text-2xl font-bold ${colorClass}`}>
                <CountUp to={value ?? 0} duration={1} />
                <span className="text-xs font-normal text-ink-500 ml-1">
                  {unit}
                </span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* FEEDBACK */}
        {Array.isArray(meal.feedback) && meal.feedback.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="font-display font-bold text-ink-900 text-base">
              Personalized Nutrition Insights
            </h3>

            {meal.feedback.map((feedback, index) => (
              <div
                key={`${feedback.type}-${index}`}
                className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm leading-relaxed ${
                  FEEDBACK_STYLES[feedback.type] || FEEDBACK_STYLES.neutral
                }`}
              >
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-forest-600" />
                <span>{feedback.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ORIGINAL INPUT */}
        {meal.mealText && (
          <div className="mt-6 text-xs sm:text-sm text-ink-600 border-t border-cream-200 pt-4">
            <span className="font-semibold text-ink-800">Original entry: </span>
            <span>"{meal.mealText}"</span>
          </div>
        )}

        {/* DISCLAIMER */}
        {meal.aiGenerated && (
          <p className="mt-6 text-xs text-ink-400">
            AI-generated nutrition metrics are estimates for habit awareness.
          </p>
        )}
      </SpotlightCard>
    </FadeContent>
  );
}

export default function MealAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/meals/history?limit=100");

      if (!response.data?.success) {
        throw new Error(
          response.data?.error || "Failed to load meal history."
        );
      }

      setMeals(Array.isArray(response.data.meals) ? response.data.meals : []);
    } catch (err) {
      console.error(
        "History error:",
        err?.response?.data || err?.message
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load meal history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!id) {
      setSelectedMeal(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        setError("");
        setSelectedMeal(null);

        const response = await api.get(`/meals/${id}`);

        if (!response.data?.success || !response.data?.meal) {
          throw new Error(
            response.data?.error || "Meal not found."
          );
        }

        setSelectedMeal(response.data.meal);
      } catch (err) {
        console.error(
          "Meal detail error:",
          err?.response?.data || err?.message
        );

        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to load that meal."
        );
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const grouped = groupByDate(meals);

  return (
    <div className="min-h-screen dietly-page-bg pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <FadeContent delay={0.05}>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
              Meal History & Logs
            </h1>

            <p className="text-ink-600 mt-1 text-sm sm:text-base">
              Explore your past analyzed meals, nutritional breakdowns, and feedback.
            </p>
          </div>
        </FadeContent>

        {/* ERROR */}
        {error && (
          <FadeContent delay={0.05}>
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
              </div>

              {!id && (
                <button
                  type="button"
                  onClick={loadHistory}
                  className="flex items-center gap-1 text-xs font-bold hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              )}
            </div>
          </FadeContent>
        )}

        {/* DETAIL VIEW */}
        {id ? (
          detailLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
            </div>
          ) : selectedMeal ? (
            <MealDetail
              meal={selectedMeal}
              onBack={() => navigate("/history")}
            />
          ) : (
            !error && (
              <div className="text-center py-16 bg-cream-50 rounded-2xl border border-cream-300">
                <p className="text-ink-600">Meal details not found.</p>
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="mt-4 px-5 py-2 bg-forest-700 text-white rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors"
                >
                  Back to History
                </button>
              </div>
            )
          )
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
          </div>
        ) : meals.length === 0 ? (
          /* EMPTY STATE */
          <FadeContent delay={0.1}>
            <div className="text-center py-16 bg-cream-50 rounded-2xl border border-dashed border-cream-300">
              <Flame className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-ink-800 font-semibold text-lg">
                No meals logged yet.
              </p>
              <p className="text-ink-400 text-sm mt-1">
                Visit the AI Meal Analyzer to describe and log your first meal.
              </p>
              <button
                type="button"
                onClick={() => navigate("/analyze")}
                className="mt-5 px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Analyze a Meal
              </button>
            </div>
          </FadeContent>
        ) : (
          /* GROUPED HISTORY TIMELINE */
          <div className="space-y-8">
            {grouped.map(([date, dayMeals], groupIdx) => (
              <FadeContent key={date} delay={0.06 * groupIdx}>
                <div>
                  <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-500 mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-600" />
                    <span>{formatDate(date)}</span>
                  </h2>

                  <div className="space-y-2.5">
                    {dayMeals.map((meal) => (
                      <SpotlightCard
                        key={meal._id}
                        className="p-4 sm:p-5 border-cream-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                        spotlightColor="rgba(79, 115, 69, 0.1)"
                      >
                        <button
                          type="button"
                          onClick={() => navigate(`/history/${meal._id}`)}
                          className="w-full text-left flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-ink-900 text-base truncate">
                              {meal.name}
                            </p>

                            <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
                              <span className="font-semibold text-forest-700">
                                {meal.calories || 0} kcal
                              </span>{" "}
                              • Protein {meal.protein || 0}g • Carbs {meal.carbs || 0}g
                            </p>

                            {meal.mealType && (
                              <p className="text-[11px] font-medium text-ink-400 mt-1 uppercase tracking-wider">
                                {meal.mealType}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                meal.aiGenerated
                                  ? "bg-forest-100 text-forest-800"
                                  : "bg-clay-100 text-clay-800"
                              }`}
                            >
                              {meal.aiGenerated ? (
                                <Sparkles className="w-3 h-3 text-forest-600" />
                              ) : (
                                <PenLine className="w-3 h-3 text-clay-600" />
                              )}
                              {meal.aiGenerated ? "AI" : "Manual"}
                            </span>

                            <ArrowRight className="w-4 h-4 text-ink-400" />
                          </div>
                        </button>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              </FadeContent>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
