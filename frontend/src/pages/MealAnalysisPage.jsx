import React, { useState } from "react";
import MealForm from "../components/MealForm.jsx";
import api from "../api/api";
import { Loader2, AlertTriangle } from "lucide-react";

export default function MealAnalysisPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMealSubmit = async (mealText) => {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await api.post("/ai/analyze", { mealText });
      setAnalysis(res.data.data);
    } catch (err) {
      console.error("Analyze error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to analyze meal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Meal Analyzer</h1>

      <MealForm onSubmit={handleMealSubmit} />

      {loading && (
        <div className="flex items-center justify-center mt-6">
          <Loader2 className="w-8 h-8 animate-spin text-green-400" />
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-2 text-yellow-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className="mt-6 p-6 bg-gray-800 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Analysis Result:</h2>
          <pre className="whitespace-pre-wrap text-gray-200">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
