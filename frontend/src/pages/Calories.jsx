import { useState } from "react";
import axios from "axios";

export default function Calories() {
  const [foodInput, setFoodInput] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [goal, setGoal] = useState(2000);

  const [calories, setCalories] = useState({
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0,
  });

  const [selectedSection, setSelectedSection] = useState("breakfast");

  // 🔥 PREVENT PAGE RELOAD ALWAYS
  const preventSubmit = (e) => e.preventDefault();

  // 🧠 Handle AI Calories Fetch + Add
  const addAICalories = async () => {
    if (!foodInput.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/ai/calc", {
        query: `How many calories in ${foodInput}? Only give number.`,
      });

      let value = parseInt(res.data.calories || 0);

      setCalories((prev) => ({
        ...prev,
        [selectedSection]: prev[selectedSection] + value,
      }));

      setFoodInput("");
    } catch (err) {
      console.error("AI error:", err);
      alert("AI error while fetching calories.");
    }
  };

  // 🔥 MANUAL CALORIE ADD
  const addManualCalories = () => {
    if (!manualInput.trim()) return;

    let value = parseInt(manualInput);
    if (isNaN(value)) return;

    setCalories((prev) => ({
      ...prev,
      [selectedSection]: prev[selectedSection] + value,
    }));

    setManualInput("");
  };

  // 🗑 RESET SPECIFIC MEAL CALORIES
  const deleteCalories = (section) => {
    setCalories((prev) => ({
      ...prev,
      [section]: 0,
    }));
  };

  const total = Object.values(calories).reduce((a, b) => a + b, 0);
  const remaining = goal > total ? goal - total : 0;
  const exceeded = total > goal;

  return (
    <div className="flex flex-col items-center p-4 bg-[#e7f7e9] min-h-screen">

      {/* GOAL INPUT */}
      <div className="bg-white p-4 rounded-xl shadow w-full max-w-lg mb-4">
        <label className="font-semibold">Daily Calorie Goal:</label>
        <input
          type="number"
          className="w-full mt-2 p-2 border rounded"
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
        />
      </div>

      {/* FOOD INPUT + AI ADD */}
      <form
        onSubmit={preventSubmit}
        className="bg-white p-4 rounded-xl shadow w-full max-w-lg mb-4"
      >
        <label className="font-semibold">Enter Food Item:</label>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            placeholder="e.g., Paneer tikka"
          />
          <button
            type="button"
            onClick={addAICalories}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            AI Add
          </button>
        </div>

        {/* SECTION SELECTION */}
        <div className="flex justify-between mt-4">
          {["breakfast", "lunch", "snacks", "dinner"].map((sec) => (
            <button
              type="button"
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded ${
                selectedSection === sec
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {sec.charAt(0).toUpperCase() + sec.slice(1)}
            </button>
          ))}
        </div>
      </form>

      {/* MANUAL CALORIES */}
      <form
        onSubmit={preventSubmit}
        className="bg-white p-4 rounded-xl shadow w-full max-w-lg mb-4"
      >
        <label className="font-semibold">Add Calories Manually:</label>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            className="flex-1 p-2 border rounded"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="e.g., 350"
          />
          <button
            type="button"
            onClick={addManualCalories}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>
      </form>

      {/* DISPLAY SECTIONS */}
      {["breakfast", "lunch", "snacks", "dinner"].map((sec) => (
        <div
          key={sec}
          className="bg-white p-4 rounded-xl shadow w-full max-w-lg mb-3 flex justify-between items-center"
        >
          <span className="font-semibold capitalize">
            {sec}: {calories[sec]} kcal
          </span>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={() => deleteCalories(sec)}
          >
            Reset
          </button>
        </div>
      ))}

      {/* TOTAL SUMMARY */}
      <div className="bg-white p-4 rounded-xl shadow w-full max-w-lg mt-4 text-center">
        <p className="text-lg font-bold">
          Total Intake:{" "}
          <span className={exceeded ? "text-red-600" : "text-green-700"}>
            {total} kcal
          </span>
        </p>

        <p className="mt-2 font-semibold">
          {exceeded ? (
            <span className="text-red-600">⚠ Goal Exceeded!</span>
          ) : (
            `Remaining: ${remaining} kcal`
          )}
        </p>
      </div>
    </div>
  );
}
