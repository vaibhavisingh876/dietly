// src/components/MealForm.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function MealForm({ onSubmit, loading = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onSubmit(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your meal: e.g. 2 chapatis, paneer curry, salad"
        rows={4}
        required
        className="w-full p-4 mb-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 bg-green-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? 'Analyzing...' : 'Analyze Meal'}
      </button>
    </form>
  );
}
