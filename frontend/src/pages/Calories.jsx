import React, { useEffect, useState } from "react";
import { Target, Droplet, Coffee, Salad, Beef, Loader2, AlertTriangle, Send, Utensils } from "lucide-react";
import api from "../api/api.js";
import Nav from "../components/Nav.jsx"; // Navbar for consistent layout

// Meal names with corresponding icons
const MEAL_TYPES = [
    { key: "breakfast", label: "Breakfast", icon: Coffee },
    { key: "lunch", label: "Lunch", icon: Salad },
    { key: "dinner", label: "Dinner", icon: Beef },
    { key: "eveningSnack", label: "Evening Snack", icon: Coffee },
];

export default function Calories() {
  const [meals, setMeals] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    eveningSnack: 0,
  });

  const [dailyGoal, setDailyGoal] = useState(2000); // Default daily calorie goal
  const [water, setWater] = useState(0);
  const [aiTip, setAiTip] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mealText, setMealText] = useState("");
  const [activeMealType, setActiveMealType] = useState(MEAL_TYPES[0].key);

  // Total calories calculation, ensuring non-negative values
  const totalCalories = Object.values(meals).reduce((a, b) => Math.max(0, a) + Math.max(0, b), 0);
  const isOverGoal = totalCalories > dailyGoal;

  // Fetch today's data and validates against negative values
  const fetchToday = async () => {
    try {
      setLoading(true);
      const res = await api.get("/calorie/today");

      if (res.data.entry) {
        const entry = res.data.entry;
        
        // Ensure no negative values are loaded from the database
        const validatedMeals = {};
        for (const key in entry.meals) {
            validatedMeals[key] = Math.max(0, entry.meals[key] || 0);
        }
        
        setMeals(validatedMeals);
        setWater(entry.waterIntake || 0);
        setDailyGoal(entry.dailyGoal || 2000);
      }
    } catch (e) {
      console.error("Error fetching today's data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  // Fetch AI plan when goal is exceeded
  useEffect(() => {
    if (isOverGoal && !loading) {
      fetchOverIntakePlan();
    } else {
      setAiTip(null);
      setAiPlan(null);
    }
  }, [totalCalories, dailyGoal, isOverGoal, loading]); 

  const fetchOverIntakePlan = async () => {
    try {
      setLoading(true);
      const res = await api.post("/calorie/ai-over-intake-plan", {
        totalCalories,
        dailyGoal,
      });

      setAiTip(res.data.tip);
      setAiPlan(res.data.nextDayPlan);
    } catch (e) {
      console.error("Error fetching AI plan:", e);
      setAiTip("Goal exceeded. Consult a professional for personalized advice.");
    } finally {
        setLoading(false);
    }
  };

  const handleGoalChange = async (value) => {
    const goal = Math.max(1000, parseInt(value) || 2000); // Goal must be at least 1000
    setDailyGoal(goal);
    try {
        await api.post("/calorie/set-goal", { goal });
    } catch (e) {
        console.error("Error setting goal:", e);
    }
  };
  
  const handleWaterChange = async (value) => {
    const num = Math.max(0, parseInt(value) || 0); // Water must be positive
    setWater(num);
    try {
        await api.post("/calorie/add-water", { amount: num });
    } catch (e) {
        console.error("Error updating water:", e);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealText.trim()) return;

    setLoading(true);

    try {
      // 1. Send meal text to AI backend
      const res = await api.post("/calorie/add-meal-text", {
        mealType: activeMealType,
        mealText: mealText,
      });

      // 2. Extract and validate the calculated calorie value from the backend response
      const newCalorieValue = Math.max(0, res.data.calories || 0); 
      
      // 3. Update the frontend state immediately
      const updatedMeals = { ...meals, [activeMealType]: newCalorieValue };
      setMeals(updatedMeals);
      
      // 4. Clear input
      setMealText("");

    } catch (e) {
      console.error("Error submitting meal:", e);
      console.log("Meal processing failed. Check your input or network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Nav /> 
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-12">
        
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-4 border-green-600 space-y-8">
          
          <h1 className="text-4xl font-extrabold text-gray-800 text-center flex items-center justify-center gap-3">
            <Target className="w-8 h-8 text-green-600" /> Daily Tracker
          </h1>

          {/* Goal and Total Summary */}
          <div className="flex justify-around items-center bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
             <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Goal (kcal)</p>
                <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => handleGoalChange(e.target.value)}
                    className="mt-1 text-xl font-extrabold text-green-600 w-24 text-center bg-transparent border-b-2 border-green-300 focus:border-green-600 outline-none transition-all"
                    min="1000"
                />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Total Intake (kcal)</p>
                <p className={`mt-1 text-3xl font-extrabold ${isOverGoal ? 'text-red-600' : 'text-green-600'}`}>
                    {totalCalories}
                </p>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Remaining (kcal)</p>
                <p className={`mt-1 text-xl font-bold ${isOverGoal ? 'text-red-500' : 'text-blue-500'}`}>
                    {dailyGoal - totalCalories}
                </p>
            </div>
          </div>


          {/* Meal Text Input Form */}
          <div className="border border-green-300 rounded-2xl p-6 bg-green-50/70 shadow-lg">
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <Utensils className="w-6 h-6" /> Log Your Meal
            </h2>
            <form onSubmit={handleMealSubmit} className="space-y-4">
              
              {/* Meal Type Selector */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                  {MEAL_TYPES.map(meal => {
                      const Icon = meal.icon;
                      const isActive = activeMealType === meal.key;
                      return (
                          <button
                              type="button"
                              key={meal.key}
                              onClick={() => setActiveMealType(meal.key)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                                  isActive 
                                      ? 'bg-green-600 text-white shadow-md' 
                                      : 'bg-white text-gray-700 hover:bg-green-100'
                              }`}
                          >
                              <Icon className="w-4 h-4" /> {meal.label}
                          </button>
                      );
                  })}
              </div>

              {/* Text Input */}
              <textarea
                  rows="3"
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-none"
                  placeholder={`Enter details for your ${activeMealType} (e.g., 2 slices of bread, 1 cup coffee, 1 banana)`}
                  disabled={loading}
              ></textarea>
              
              {/* Submit Button */}
              <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 shadow-lg"
                  disabled={loading || !mealText.trim()}
              >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Log Meal & Get Calories
                    </>
                  )}
              </button>
            </form>
          </div>

          {/* Today's Calorie Log Summary */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Today's Calorie Log</h2>
            {MEAL_TYPES.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-green-500" />
                        <span className="font-semibold text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-gray-800">{meals[key] || 0}</span>
                        <span className="text-sm text-gray-500 ml-1">kcal</span>
                    </div>
                </div>
            ))}
          </div>
          

          {/* Water Input */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <label className="font-extrabold text-lg text-blue-700 flex items-center gap-3">
              <Droplet className="w-6 h-6 fill-blue-500 text-white" /> Water Intake (ml)
            </label>
            <input
              type="number"
              value={water}
              onChange={(e) => handleWaterChange(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg px-3 py-2 w-28 text-right text-gray-800 font-medium"
              placeholder="ml"
              min="0"
            />
          </div>
        </div>

        {/* AI OVER-INTAKE ALERT AND TIPS */}
        {isOverGoal && (
            <div className="mt-8 p-6 bg-red-50 border-4 border-red-400 rounded-3xl shadow-xl space-y-6 animate-pulseRed">
                <div className="flex items-center gap-4 text-red-700">
                    <AlertTriangle className="w-8 h-8 fill-red-500 text-white" />
                    <h2 className="text-2xl font-extrabold">GOAL EXCEEDED!</h2>
                    <span className="text-xl font-bold ml-auto">+{totalCalories - dailyGoal} kcal Surplus</span>
                </div>

                {/* AI TIP (To spend calories today) */}
                {aiTip && (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">🔥 Today's Action Plan:</h3>
                        <p className="p-3 bg-red-100 rounded-xl border border-red-200 text-red-800 font-medium shadow-inner italic">
                            {aiTip}
                        </p>
                    </div>
                )}
                
                {/* AI NEXT DAY PLAN */}
                {aiPlan && (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">🗓️ Next Day Diet Focus (Low Calorie):</h3>
                        <div className="space-y-2">
                            {aiPlan.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                    <span className="font-semibold text-gray-700 w-1/4">{item.meal}:</span>
                                    <span className="text-gray-600 w-3/4 pl-2">{item.food}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <style>{`
          @keyframes pulseRed {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 10px 5px rgba(239, 68, 68, 0.7); }
          }
          .animate-pulseRed {
            animation: pulseRed 3s infinite;
          }
        `}</style>

      </div>
    </div>
  );
}