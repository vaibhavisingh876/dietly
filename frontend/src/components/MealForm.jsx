import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

const MAX_LENGTH = 1000;

export default function MealForm({ onSubmit, loading = false }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setError("Please describe what you ate.");
      return;
    }

    if (trimmedText.length > MAX_LENGTH) {
      setError(
        `Meal description must be ${MAX_LENGTH} characters or less.`
      );
      return;
    }

    setError("");
    onSubmit(trimmedText);
    setText("");
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setText(value);

    if (error) {
      setError("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-green-600" />

        <h3 className="font-semibold text-gray-800">
          Describe your meal
        </h3>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="e.g. 2 chapatis, paneer curry, salad"
        rows={4}
        maxLength={MAX_LENGTH}
        disabled={loading}
        required
        className="w-full p-4 mb-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
      />

      <div className="flex justify-between items-center mb-4">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-gray-400">
            Include portions for a more useful estimate.
          </p>
        )}

        <span
          className={`text-xs ${
            text.length >= MAX_LENGTH
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="w-full flex justify-center items-center gap-2 bg-green-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}

        {loading ? "Analyzing..." : "Analyze Meal"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Nutrition values are AI estimates and may not be exact.
      </p>
    </form>
  );
}