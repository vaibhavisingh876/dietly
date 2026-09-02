import React, { useEffect, useState } from "react";
import MealForm from "../components/MealForm.jsx";
import api from "../api/api";
import Nav from "../components/Nav.jsx";
import { Flame, CheckCircle, XCircle, AlertTriangle, Trophy, Zap, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const BAR_COLORS = { Calories: "#22c55e", Protein: "#3b82f6", Carbs: "#f97316", Fat: "#e11d48", Fiber: "#8b5cf6" };
const PIE_COLORS = ["#3b82f6", "#f97316", "#e11d48", "#8b5cf6"]; // Protein, Carbs, Fat, Fiber

const FEEDBACK_STYLES = {
  positive: { icon: CheckCircle, className: "text-green-700 bg-green-50 border-green-200" },
  warning: { icon: AlertTriangle, className: "text-amber-700 bg-amber-50 border-amber-200" },
  neutral: { icon: Flame, className: "text-gray-700 bg-gray-50 border-gray-200" },
};

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(null); // real, DB-backed streak — null until loaded
  const [streakLoading, setStreakLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStreak = async () => {
    try {
      setStreakLoading(true);
      const res = await api.get("/progress/streak");
      setStreak(res.data?.currentStreak ?? 0);
    } catch (err) {
      console.error("Failed to load streak:", err.response?.data || err.message);
      setStreak(null);
    } finally {
      setStreakLoading(false);
    }
  };

  useEffect(() => {
    loadStreak();
  }, []);

  const analyze = async (mealText) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/meals/analyze", { text: mealText });

      if (!res.data || !res.data.data) throw new Error("Invalid response");

      setResult(res.data.data);
      // The meal is already saved server-side (Meal History + Progress).
      // Refresh the real streak instead of incrementing a local counter.
      loadStreak();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Error analyzing meal.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts from the structured numeric macros
  const barData = result
    ? [
        { name: "Calories", value: result.calories },
        { name: "Protein", value: result.protein },
        { name: "Carbs", value: result.carbs },
        { name: "Fat", value: result.fat },
        { name: "Fiber", value: result.fiber },
      ]
    : [];

  const pieData = result
    ? [
        { name: "Protein", value: result.protein },
        { name: "Carbs", value: result.carbs },
        { name: "Fat", value: result.fat },
        { name: "Fiber", value: result.fiber },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Nav />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-4 pt-8">AI Meal Analyzer</h1>
        <p className="text-center text-xl text-gray-600 font-medium">
          Log your meal, get instant personalized nutrition insights, and build a real tracking streak.
        </p>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-4 border-green-600">
          <MealForm onSubmit={analyze} loading={loading} />
          {error && <div className="mt-6 p-4 text-red-700 bg-red-100 rounded-xl flex items-center gap-2"><XCircle className="w-5 h-5" /> {error}</div>}
        </div>

        {loading && (
          <div className="text-center p-12 text-xl font-medium text-green-700 bg-white rounded-3xl shadow-xl border border-green-200">
            <Loader2 className="w-10 h-10 text-green-600 mx-auto mb-4 animate-spin" /> Generating AI Report... Please wait.
          </div>
        )}

        {!loading && !result && !error && (
          <div className="text-center p-12 text-gray-500 bg-white/60 rounded-3xl border border-dashed border-gray-300">
            Describe a meal above to get a personalized AI nutrition report.
          </div>
        )}

        {result && (
          <div className="bg-white rounded-3xl shadow-2xl border-t-8 border-emerald-600 overflow-hidden transform transition-all duration-500 ease-out animate-fadeIn">
            <div className="p-8 border-b border-gray-100 bg-emerald-50 flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-3xl font-extrabold text-emerald-800 flex items-center gap-3">
                <Zap className="w-8 h-8 fill-emerald-600 text-white" /> AI Nutrition Report
              </h2>
              <div className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-lg shadow-xl">
                <Trophy className="w-5 h-5 fill-current" />
                {streakLoading ? "Loading streak..." : streak === null ? "Streak unavailable" : `Streak: ${streak} day${streak === 1 ? "" : "s"}`}
              </div>
            </div>

            <div className="p-8 space-y-10">
              {result.summary && (
                <div className="bg-green-100/70 p-6 rounded-2xl border border-green-200 shadow-inner">
                  <p className="text-gray-700 text-xl leading-relaxed italic">
                    <span className="font-extrabold text-green-800 mr-2 not-italic">AI Summary:</span> "{result.summary}"
                  </p>
                </div>
              )}

              {/* Personalized feedback (includes allergy/diet/goal conflicts) */}
              {Array.isArray(result.feedback) && result.feedback.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">Personalized Feedback</h3>
                  {result.feedback.map((f, i) => {
                    const style = FEEDBACK_STYLES[f.type] || FEEDBACK_STYLES.neutral;
                    const Icon = style.icon;
                    return (
                      <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${style.className}`}>
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{f.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nutritional Bar Chart */}
              {barData.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Nutritional Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {barData.map((entry, index) => (
                          <Cell key={index} fill={BAR_COLORS[entry.name] || "#22c55e"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Macronutrient Pie Chart */}
              {pieData.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Macronutrient Proportion (grams)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p className="text-sm text-gray-400 text-center">
                Saved to your meal history. View it anytime on the History or Progress pages.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}