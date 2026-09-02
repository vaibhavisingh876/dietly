import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Target,
  Apple,
  Calendar,
  Ruler,
  Scale,
  Loader2,
  AlertTriangle,
  Activity,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

import api from "../api/api";
import {
  logout as clearAuth,
  getUser,
  saveAuth,
} from "../utils/auth";

const DIETARY_PREFERENCES = [
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
  "Pescatarian",
];

const ALLERGIES = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Fish",
];

const HEALTH_GOALS = [
  "Weight Loss",
  "More Energy",
  "Muscle Gain",
  "Balanced Diet",
  "Better Sleep",
  "Stress Relief",
];

const LIFESTYLES = [
  "Sedentary",
  "Moderate",
  "Active",
  "Very Active",
];

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  fallback;

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
    dietaryPreferences: "",
    allergies: [],
    healthGoals: [],
    lifestyle: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/profile");

      if (!response.data?.success || !response.data?.user) {
        throw new Error("Unable to load profile");
      }

      const currentUser = response.data.user;
      const currentProfile =
        currentUser.profile || {};

      setUser(currentUser);
      setProfile(currentProfile);

      setForm({
        name: currentUser.name || "",
        age: currentProfile.age || "",
        height: currentProfile.height || "",
        weight: currentProfile.weight || "",
        gender: currentProfile.gender || "",
        dietaryPreferences:
          currentProfile.dietaryPreferences || "",
        allergies: currentProfile.allergies || [],
        healthGoals: currentProfile.healthGoals || [],
        lifestyle: currentProfile.lifestyle || "",
      });
    } catch (err) {
      console.error(
        "Profile fetch failed:",
        err
      );

      if (err?.response?.status === 401) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Failed to load your profile."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearAuth();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const toggleMulti = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];

      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: next,
      };
    });

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Name cannot be empty.";
    }

    if (
      !form.age ||
      Number(form.age) <= 0 ||
      Number(form.age) > 120
    ) {
      return "Please enter a valid age.";
    }

    if (
      !form.height ||
      Number(form.height) <= 0
    ) {
      return "Please enter a valid height.";
    }

    if (
      !form.weight ||
      Number(form.weight) <= 0
    ) {
      return "Please enter a valid weight.";
    }

    if (!form.gender) {
      return "Please select your gender.";
    }

    if (!form.dietaryPreferences) {
      return "Please select your diet preference.";
    }

    if (!form.lifestyle) {
      return "Please select your lifestyle.";
    }

    if (
      !Array.isArray(form.healthGoals) ||
      form.healthGoals.length === 0
    ) {
      return "Please select at least one health goal.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        gender: form.gender,
        dietaryPreferences:
          form.dietaryPreferences,
        allergies: form.allergies || [],
        healthGoals: form.healthGoals || [],
        lifestyle: form.lifestyle,
      };

      const response = await api.put(
        "/auth/profile",
        payload
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update profile."
        );
      }

      const updatedUser =
        response.data.user;

      const updatedProfile =
        response.data.profile ||
        updatedUser?.profile ||
        {};

      setUser(updatedUser);
      setProfile(updatedProfile);

      setForm({
        name: updatedUser?.name || "",
        age: updatedProfile.age || "",
        height: updatedProfile.height || "",
        weight: updatedProfile.weight || "",
        gender: updatedProfile.gender || "",
        dietaryPreferences:
          updatedProfile.dietaryPreferences ||
          "",
        allergies:
          updatedProfile.allergies || [],
        healthGoals:
          updatedProfile.healthGoals || [],
        lifestyle:
          updatedProfile.lifestyle || "",
      });

      /*
       * Keep Navbar/auth storage in sync
       * after changing the user's name/profile.
       */
      const oldUser = getUser();

      if (oldUser && updatedUser) {
        saveAuth({
          token:
            localStorage.getItem("token") ||
            sessionStorage.getItem("token"),
          user: updatedUser,
          persist: Boolean(
            localStorage.getItem("token")
          ),
        });
      }

      window.dispatchEvent(
        new Event("authChanged")
      );

      setEditing(false);
      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to save your profile. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setForm({
      name: user?.name || "",
      age: profile.age || "",
      height: profile.height || "",
      weight: profile.weight || "",
      gender: profile.gender || "",
      dietaryPreferences:
        profile.dietaryPreferences || "",
      allergies: profile.allergies || [],
      healthGoals: profile.healthGoals || [],
      lifestyle: profile.lifestyle || "",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  const redoQuestionnaire = () => {
    navigate("/questionnaire");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-8 h-8 mb-3 text-yellow-400" />

        <p className="text-gray-300 text-center">
          Failed to load your profile.
        </p>

        <button
          type="button"
          onClick={fetchProfile}
          className="mt-4 px-5 py-2 bg-green-500 hover:bg-green-600 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-28 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* HEADER */}
          <div className="p-8 text-center border-b border-gray-700">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-green-400" />
            </div>

            <h1 className="text-2xl font-bold">
              {user.name ||
                user.email?.split("@")[0]}
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              {user.email}
            </p>
          </div>

          {/* MESSAGES */}
          <div className="px-6">
            {error && (
              <div className="mt-5 flex items-start gap-2 p-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-5 p-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg text-sm">
                {success}
              </div>
            )}
          </div>

          {!editing ? (
            <div className="p-6">
              {/* PROFILE INFO */}
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-blue-400" />
                  <span>
                    Height:{" "}
                    <strong className="text-white">
                      {profile.height || "-"} cm
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <span>
                    Weight:{" "}
                    <strong className="text-white">
                      {profile.weight || "-"} kg
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>
                    Age:{" "}
                    <strong className="text-white">
                      {profile.age || "-"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span>
                    Lifestyle:{" "}
                    <strong className="text-white">
                      {profile.lifestyle || "-"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                  <span>
                    Goals:{" "}
                    <strong className="text-white">
                      {(
                        profile.healthGoals ||
                        []
                      ).join(", ") || "-"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Apple className="w-5 h-5 text-blue-400" />
                  <span>
                    Diet:{" "}
                    <strong className="text-white">
                      {profile.dietaryPreferences ||
                        "-"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-blue-400 mt-0.5" />
                  <span>
                    Allergies:{" "}
                    <strong className="text-white">
                      {(
                        profile.allergies || []
                      ).join(", ") || "None"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* CALORIE GOAL */}
              {profile.calorieGoal && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-xl">
                  <p className="text-green-300 font-semibold">
                    Estimated daily calorie goal
                  </p>

                  <p className="text-2xl font-bold text-white mt-1">
                    {profile.calorieGoalOverride ||
                      profile.calorieGoal}{" "}
                    kcal
                  </p>

                  <p className="text-xs text-green-400/70 mt-2">
                    This is an estimate based on
                    your profile, not medical advice.
                  </p>
                </div>
              )}

              {/* ACTIONS */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditing(true);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={redoQuestionnaire}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Redo Questionnaire
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                />
              </div>

              {/* BASIC INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Age
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="120"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Height (cm)
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Weight (kg)
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                  />
                </div>
              </div>

              {/* GENDER */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Gender
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* DIET */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Diet Preference
                </label>

                <select
                  name="dietaryPreferences"
                  value={
                    form.dietaryPreferences
                  }
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                >
                  <option value="">
                    Select one
                  </option>

                  {DIETARY_PREFERENCES.map(
                    (diet) => (
                      <option
                        key={diet}
                        value={diet}
                      >
                        {diet}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* LIFESTYLE */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Lifestyle
                </label>

                <select
                  name="lifestyle"
                  value={form.lifestyle}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:border-green-400"
                >
                  <option value="">
                    Select one
                  </option>

                  {LIFESTYLES.map(
                    (lifestyle) => (
                      <option
                        key={lifestyle}
                        value={lifestyle}
                      >
                        {lifestyle}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* ALLERGIES */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">
                  Allergies
                </p>

                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map(
                    (allergy) => {
                      const selected =
                        (
                          form.allergies ||
                          []
                        ).includes(allergy);

                      return (
                        <button
                          type="button"
                          key={allergy}
                          onClick={() =>
                            toggleMulti(
                              "allergies",
                              allergy
                            )
                          }
                          className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                            selected
                              ? "bg-red-500 border-red-400 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {allergy}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* GOALS */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">
                  Health Goals
                </p>

                <div className="flex flex-wrap gap-2">
                  {HEALTH_GOALS.map(
                    (goal) => {
                      const selected =
                        (
                          form.healthGoals ||
                          []
                        ).includes(goal);

                      return (
                        <button
                          type="button"
                          key={goal}
                          onClick={() =>
                            toggleMulti(
                              "healthGoals",
                              goal
                            )
                          }
                          className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                            selected
                              ? "bg-green-500 border-green-400 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* SAVE/CANCEL */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                >
                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 py-3 rounded-lg disabled:opacity-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* LOGOUT */}
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}