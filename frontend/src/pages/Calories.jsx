import React, { useEffect, useState } from "react";
import { Target, Droplet } from "lucide-react";
import api from "../api/api";

export default function Calories() {
  const [meals, setMeals] = useState({ breakfast:0, lunch:0, dinner:0, eveningSnack:0 });
  const [water, setWater] = useState(0);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [goalWater, setGoalWater] = useState(2000); // ml

  const [aiTip, setAiTip] = useState("");

  const fetchToday = async () => {
    const res = await api.get("/calorie/today");
    if(res.data.entry){
      setMeals(res.data.entry.meals);
      setWater(res.data.entry.waterIntake);
    }
  };

  useEffect(() => { fetchToday(); }, []);

  const handleMealChange = async (meal, value) => {
    const num = parseInt(value) || 0;
    setMeals(prev => ({ ...prev, [meal]: num }));
    await api.post("/calorie/add-meal", { mealType: meal, calories: num });
    generateAiTip({ ...meals, [meal]: num }, water);
  };

  const handleWaterChange = async (value) => {
    const num = parseInt(value) || 0;
    setWater(num);
    await api.post("/calorie/add-water", { amount: num });
    generateAiTip(meals, num);
  };

  const generateAiTip = (mealsObj, waterIntake) => {
    const totalCalories = Object.values(mealsObj).reduce((a,b)=>a+b,0);
    let tip = "";
    if(totalCalories > goalCalories) tip += "⚠️ You exceeded your calorie goal today! ";
    else tip += "✅ You are within your calorie goal. ";

    if(waterIntake < goalWater) tip += `💧 Drink ${goalWater - waterIntake}ml more water.`;
    else tip += "💧 You reached your water goal!";

    setAiTip(tip);
  };

  const totalCalories = Object.values(meals).reduce((a,b)=>a+b,0);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-24">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Target className="w-6 h-6"/> Calorie & Water Tracker</h2>

      {["breakfast","lunch","dinner","eveningSnack"].map(meal => (
        <div key={meal} className="flex justify-between items-center mb-3">
          <label className="capitalize font-semibold">{meal}</label>
          <input type="number" value={meals[meal]} onChange={e=>handleMealChange(meal, e.target.value)} className="border rounded px-3 py-1 w-24"/>
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <label className="font-semibold flex items-center gap-2"><Droplet className="w-5 h-5"/> Water (ml)</label>
        <input type="number" value={water} onChange={e=>handleWaterChange(e.target.value)} className="border rounded px-3 py-1 w-24"/>
      </div>

      <div className="mt-6 font-bold">
        Total Calories: {totalCalories} kcal
      </div>
      <div className="mt-2 font-medium">
        {aiTip}
      </div>
    </div>
  );
}
