// src/pages/MealAnalysisPage.jsx
//
// Meal History. This used to be a second, duplicate "AI Meal Analyzer"
// form that called the same endpoint as Analyze.jsx and just dumped the
// raw JSON response — dead, duplicate functionality. It's now the Meal
// History page: it lists meals that were actually saved to the database
// (by Analyze.jsx or the Calories page's "AI Add"), and lets you open one
// to see its full detail. Reachable at /history and /history/:id.
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import api from "../api/api";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  PenLine,
  ChevronLeft,
  CheckCircle,
  Flame,
} from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDate(meals) {
  const groups = {};
  for (const meal of meals) {
    const key = meal.date || "Unknown date";
    if (!groups[key]) groups[key] = [];
    groups[key].push(meal);
  }
  // Newest date first
  return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

const FEEDBACK_STYLES = {
  positive: "text-green-700 bg-green-50 border-green-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  neutral: "text-gray-700 bg-gray-50 border-gray-200",
};

function MealDetail({ meal, onBack }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to history
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{meal.name}</h2>
          <p className="text-sm text-gray-500">
            {formatDate(meal.date)} {meal.mealType ? `• ${meal.mealType}` : ""}
          </p>
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
            meal.aiGenerated ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {meal.aiGenerated ? <Sparkles className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
          {meal.aiGenerated ? "AI-analyzed" : "Manually added"}
        </span>
      </div>

      {meal.summary && (
        <p className="text-gray-700 italic bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
          "{meal.summary}"
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          ["Calories", meal.calories, "kcal"],
          ["Protein", meal.protein, "g"],
          ["Carbs", meal.carbs, "g"],
          ["Fat", meal.fat, "g"],
          ["Fiber", meal.fiber, "g"],
        ].map(([label, value, unit]) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-lg font-bold text-gray-800">
              {value ?? 0}
              <span className="text-xs font-normal text-gray-500">{unit}</span>
            </p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {Array.isArray(meal.feedback) && meal.feedback.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Feedback</h3>
          {meal.feedback.map((f, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${FEEDBACK_STYLES[f.type] || FEEDBACK_STYLES.neutral}`}>
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      )}

      {meal.mealText && (
        <div className="mt-6 text-sm text-gray-500">
          <span className="font-semibold">Original entry: </span>
          {meal.mealText}
        </div>
      )}
    </div>
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
      const res = await api.get("/meals/history");
      setMeals(res.data?.meals || []);
    } catch (err) {
      console.error("History error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to load meal history.");
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
        const res = await api.get(`/meals/${id}`);
        setSelectedMeal(res.data?.meal || null);
      } catch (err) {
        console.error("Meal detail error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to load that meal.");
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const grouped = groupByDate(meals);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <Nav />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Meal History</h1>
        <p className="text-center text-gray-500 mb-8">Meals you've analyzed or logged, saved to your account.</p>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {id ? (
          detailLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : selectedMeal ? (
            <MealDetail meal={selectedMeal} onBack={() => navigate("/history")} />
          ) : (
            !error && <p className="text-center text-gray-500">Meal not found.</p>
          )
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
            <Flame className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No meals logged yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Head to the Analyze page to log your first meal.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([date, dayMeals]) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {formatDate(date)}
                </h2>
                <div className="space-y-3">
                  {dayMeals.map((meal) => (
                    <button
                      key={meal._id}
                      onClick={() => navigate(`/history/${meal._id}`)}
                      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center justify-between gap-4 hover:border-green-300 hover:shadow-md transition-all"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{meal.name}</p>
                        <p className="text-sm text-gray-500">
                          {meal.calories || 0} kcal • Protein {meal.protein || 0}g
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                          meal.aiGenerated ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {meal.aiGenerated ? <Sparkles className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
                        {meal.aiGenerated ? "AI" : "Manual"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}