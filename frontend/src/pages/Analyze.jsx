import React, { useState } from "react";
import MealForm from "../components/MealForm.jsx";
import api from "../api/api";
import Nav from "../components/Nav.jsx";
import { Flame, Utensils, CheckCircle, XCircle, Trophy, Zap, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#22c55e", "#10b981", "#facc15", "#f97316", "#3b82f6"];
const BAR_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#e11d48", "#facc15", "#8b5cf6"];
const PIE_COLORS = ["#22c55e", "#3b82f6", "#f97316"]; // Protein, Fat, Carbs

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (mealText) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/ai/analyze", { mealText });

      if (!res.data || !res.data.data) throw new Error("Invalid response");

      setResult(res.data.data);
      setStreak((prev) => prev + 1);

    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Error analyzing meal.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const barData = result?.macros?.map((m) => ({ name: m.name, value: parseFloat(m.value) || 0 })) || [];
  const pieData = result?.macros?.filter((m) => ["Protein", "Fat", "Carbs"].includes(m.name))
    .map((m) => ({ name: m.name, value: parseFloat(m.value) || 0 })) || [];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Nav />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-4 pt-8">AI Meal Analyzer</h1>
        <p className="text-center text-xl text-gray-600 font-medium">
          Log your meal, get instant nutritional insights, and track your health progress.
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

        {result && (
          <div className="bg-white rounded-3xl shadow-2xl border-t-8 border-emerald-600 overflow-hidden transform transition-all duration-500 ease-out animate-fadeIn">
            <div className="p-8 border-b border-gray-100 bg-emerald-50 flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-3xl font-extrabold text-emerald-800 flex items-center gap-3">
                <Zap className="w-8 h-8 fill-emerald-600 text-white" /> AI Nutrition Report
              </h2>
              <div className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-lg shadow-xl">
                <Trophy className="w-5 h-5 fill-current" /> Streak: {streak} days
              </div>
            </div>

            <div className="p-8 space-y-12">
              {result.summary && (
                <div className="bg-green-100/70 p-6 rounded-2xl border border-green-200 shadow-inner">
                  <p className="text-gray-700 text-xl leading-relaxed italic">
                    <span className="font-extrabold text-green-800 mr-2 not-italic">AI Summary:</span> "{result.summary}"
                  </p>
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
                          <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>

                  </ResponsiveContainer>
                </div>
              )}

              {/* Macronutrient Pie Chart */}
              {pieData.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Macronutrient Proportion</h3>
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
