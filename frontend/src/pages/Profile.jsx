import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Target,
  Apple,
  Calendar,
  Ruler,
  Scale,
  Loader2,
  AlertTriangle,
  Activity,
  ShieldAlert,
} from "lucide-react";
import api from "../api/api";
import { logout as clearAuth } from "../utils/auth";

const DIETARY_PREFERENCES = ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian"];
const ALLERGIES = ["Gluten", "Dairy", "Eggs", "Fish"];
const HEALTH_GOALS = [
  "Weight Loss",
  "More Energy",
  "Muscle Gain",
  "Balanced Diet",
  "Better Sleep",
  "Stress Relief",
];
const LIFESTYLES = ["Sedentary", "Moderate", "Active", "Very Active"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");

        if (response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.user.profile || {});
          setForm({
            name: response.data.user.name || "",
            age: response.data.user.profile?.age || "",
            height: response.data.user.profile?.height || "",
            weight: response.data.user.profile?.weight || "",
            gender: response.data.user.profile?.gender || "",
            dietaryPreferences: response.data.user.profile?.dietaryPreferences || "",
            allergies: response.data.user.profile?.allergies || [],
            healthGoals: response.data.user.profile?.healthGoals || [],
            lifestyle: response.data.user.profile?.lifestyle || "",
          });
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMulti = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await api.put("/auth/profile", { ...form });

      if (response.data.success) {
        setProfile(response.data.profile);
        setUser(response.data.user);
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <AlertTriangle className="w-8 h-8 mb-2 text-yellow-400" />
        <p>Failed to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-28">
      <div className="flex flex-col items-center justify-center px-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <User className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold">{user.name || user.email.split("@")[0]}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!editing ? (
            <div className="mt-6 space-y-3 text-gray-300">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-blue-400" />
                Height: {profile.height || "-"} cm
              </div>
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-blue-400" />
                Weight: {profile.weight || "-"} kg
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                Age: {profile.age || "-"}
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                Lifestyle: {profile.lifestyle || "-"}
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-400" />
                Goals: {(profile.healthGoals || []).join(", ") || "-"}
              </div>
              <div className="flex items-center gap-3">
                <Apple className="w-5 h-5 text-blue-400" />
                Diet: {profile.dietaryPreferences || "-"}
              </div>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                Allergies: {(profile.allergies || []).join(", ") || "None"}
              </div>
              {profile.calorieGoal && (
                <div className="mt-2 p-3 bg-green-900/30 border border-green-700 rounded-lg text-sm text-green-300">
                  Estimated daily calorie goal: <strong>{profile.calorieGoalOverride || profile.calorieGoal} kcal</strong>
                  <span className="block text-xs text-green-400/70 mt-1">
                    This is an estimate based on your profile, not medical advice.
                  </span>
                </div>
              )}

              <button
                onClick={() => setEditing(true)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-gray-300">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  value={form.height || ""}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 text-white"
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={form.weight || ""}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 text-white"
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={form.age || ""}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 text-white"
                />
              </div>

              <select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <div>
                <p className="text-sm font-semibold mb-2">Diet preference</p>
                <select
                  name="dietaryPreferences"
                  value={form.dietaryPreferences || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Select one</option>
                  {DIETARY_PREFERENCES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Lifestyle / activity level</p>
                <select
                  name="lifestyle"
                  value={form.lifestyle || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                >
                  <option value="">Select one</option>
                  {LIFESTYLES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Allergies (select all that apply)</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleMulti("allergies", a)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        (form.allergies || []).includes(a)
                          ? "bg-red-500 border-red-400 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Health goals (select all that apply)</p>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleMulti("healthGoals", g)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        (form.healthGoals || []).includes(g)
                          ? "bg-green-500 border-green-400 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="flex-1 bg-red-500 hover:bg-red-600 py-2 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-8 flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}