import React, { useEffect, useState } from 'react';
import { Leaf, Drop } from 'lucide-react';

export default function Calories() {
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Evening Snack'];
  const [mealCalories, setMealCalories] = useState({});
  const [waterCount, setWaterCount] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000); // default goal
  const [totalCalories, setTotalCalories] = useState(0);

  // Load saved data from localStorage
  useEffect(() => {
    const savedMeals = JSON.parse(localStorage.getItem('mealCalories')) || {};
    const savedWater = parseInt(localStorage.getItem('waterCount')) || 0;
    setMealCalories(savedMeals);
    setWaterCount(savedWater);
  }, []);

  useEffect(() => {
    const total = Object.values(mealCalories).reduce((a, b) => a + (parseInt(b) || 0), 0);
    setTotalCalories(total);
  }, [mealCalories]);

  const handleMealChange = (meal, value) => {
    const updated = { ...mealCalories, [meal]: parseInt(value) || 0 };
    setMealCalories(updated);
    localStorage.setItem('mealCalories', JSON.stringify(updated));
  };

  const handleAddWater = () => {
    const newCount = waterCount + 1;
    setWaterCount(newCount);
    localStorage.setItem('waterCount', newCount);
  };

  const resetDaily = () => {
    setMealCalories({});
    setWaterCount(0);
    localStorage.removeItem('mealCalories');
    localStorage.removeItem('waterCount');
  };

  const caloriePercentage = Math.min(Math.round((totalCalories / calorieGoal) * 100), 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-green-600 to-green-700 mb-8">
        Calorie & Water Tracker
      </h1>

      <div className="w-full max-w-3xl space-y-6">
        {/* Meal Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meals.map((meal) => (
            <div key={meal} className="bg-white rounded-3xl shadow-lg p-4 flex flex-col">
              <span className="font-bold text-lg text-gray-700 mb-2">{meal}</span>
              <input
                type="number"
                placeholder="Enter calories"
                value={mealCalories[meal] || ''}
                onChange={(e) => handleMealChange(meal, e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>
          ))}
        </div>

        {/* Water Tracker */}
        <div className="bg-white rounded-3xl shadow-lg p-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Drop className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-gray-700 text-lg">Water Glasses: {waterCount}</span>
          </div>
          <button
            onClick={handleAddWater}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:scale-105 transition-transform"
          >
            +1 Glass
          </button>
        </div>

        {/* Total Calories */}
        <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-lg font-bold text-gray-700 mb-2">Total Calories</span>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-2">
            <div
              className="h-6 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-center font-semibold"
              style={{ width: `${caloriePercentage}%` }}
            >
              {caloriePercentage}%
            </div>
          </div>
          <span className="text-gray-600">Goal: {calorieGoal} kcal</span>
          {caloriePercentage >= 100 ? (
            <span className="mt-2 text-green-700 font-bold">🎉 Goal Achieved!</span>
          ) : (
            <span className="mt-2 text-gray-700 font-medium">Keep going!</span>
          )}
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <button
            onClick={resetDaily}
            className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Reset Daily
          </button>
        </div>
      </div>
    </div>
  );
}
