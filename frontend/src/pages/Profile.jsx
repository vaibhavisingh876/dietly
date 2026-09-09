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
  CheckCircle2,
} from "lucide-react";

import api from "../api/api";
import {
  logout as clearAuth,
  getUser,
  saveAuth,
} from "../utils/auth";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

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
      const currentProfile = currentUser.profile || {};

      setUser(currentUser);
      setProfile(currentProfile);

      setForm({
        name: currentUser.name || "",
        age: currentProfile.age || "",
        height: currentProfile.height || "",
        weight: currentProfile.weight || "",
        gender: currentProfile.gender || "",
        dietaryPreferences: currentProfile.dietaryPreferences || "",
        allergies: Array.isArray(currentProfile.allergies)
          ? currentProfile.allergies
          : [],
        healthGoals: Array.isArray(currentProfile.healthGoals)
          ? currentProfile.healthGoals
          : [],
        lifestyle: currentProfile.lifestyle || "",
      });
    } catch (err) {
      console.error("Profile load error:", err);
      setError(
        getErrorMessage(
          err,
          "Failed to load profile. Please refresh."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMulti = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    if (
      form.age &&
      (Number(form.age) < 1 || Number(form.age) > 120)
    ) {
      setError("Please enter a valid age between 1 and 120");
      return;
    }

    if (
      form.height &&
      (Number(form.height) < 50 || Number(form.height) > 300)
    ) {
      setError("Please enter a valid height (50 - 300 cm)");
      return;
    }

    if (
      form.weight &&
      (Number(form.weight) < 20 || Number(form.weight) > 500)
    ) {
      setError("Please enter a valid weight (20 - 500 kg)");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        profile: {
          age: form.age ? Number(form.age) : undefined,
          height: form.height ? Number(form.height) : undefined,
          weight: form.weight ? Number(form.weight) : undefined,
          gender: form.gender || undefined,
          dietaryPreferences: form.dietaryPreferences || undefined,
          allergies: form.allergies,
          healthGoals: form.healthGoals,
          lifestyle: form.lifestyle || undefined,
        },
      };

      const response = await api.put("/auth/profile", payload);

      if (!response.data?.success || !response.data?.user) {
        throw new Error("Update failed");
      }

      const updatedUser = response.data.user;
      setUser(updatedUser);
      setProfile(updatedUser.profile || {});

      saveAuth({
        user: updatedUser,
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(
        getErrorMessage(
          err,
          "Failed to update profile. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const cancelEditing = () => {
    if (user) {
      setForm({
        name: user.name || "",
        age: profile.age || "",
        height: profile.height || "",
        weight: profile.weight || "",
        gender: profile.gender || "",
        dietaryPreferences: profile.dietaryPreferences || "",
        allergies: profile.allergies || [],
        healthGoals: profile.healthGoals || [],
        lifestyle: profile.lifestyle || "",
      });
    }

    setError("");
    setSuccess("");
    setEditing(false);
  };

  const redoQuestionnaire = () => {
    navigate("/questionnaire");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center bg-cream-50 p-8 rounded-2xl shadow-sm border border-cream-300">
          <Loader2 className="w-8 h-8 text-forest-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-ink-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-100 text-ink-900 flex flex-col items-center justify-center px-4">
        <div className="bg-cream-50 p-8 rounded-2xl border border-cream-300 text-center max-w-sm">
          <AlertTriangle className="w-8 h-8 mb-3 text-amber-500 mx-auto" />
          <p className="text-ink-700 font-medium">
            Failed to load your profile.
          </p>
          <button
            type="button"
            onClick={fetchProfile}
            className="mt-4 px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dietly-page-bg text-ink-900 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <FadeContent delay={0.05}>
          {/* Notifications */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium shadow-sm">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-forest-50 border border-forest-200 text-forest-800 rounded-2xl text-sm font-medium shadow-sm">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <SpotlightCard
            className="shadow-sm border-cream-300 overflow-hidden"
            spotlightColor="rgba(79, 115, 69, 0.1)"
          >
            {!editing ? (
              <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                {/* LEFT SIDE */}
                <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-cream-200 bg-cream-50/60">
                  {/* Profile Info */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-forest-100 border-2 border-forest-200 text-forest-800 flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-display shadow-sm">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                      {user.name || user.email?.split("@")[0]}
                    </h1>

                    <p className="text-ink-500 text-xs sm:text-sm mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="my-6 border-t border-cream-200" />

                  {/* Calorie Goal Card */}
                  {profile.calorieGoal && (
                    <div className="p-5 rounded-2xl bg-forest-50/80 border border-forest-200/80 text-center mb-6">
                      <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center mx-auto mb-2.5 text-forest-700">
                        <Activity className="w-5 h-5" />
                      </div>

                      <p className="text-forest-800 text-xs font-semibold uppercase tracking-wider">
                        Estimated Daily Calorie Target
                      </p>

                      <p className="text-3xl font-bold text-ink-900 mt-1.5">
                        <CountUp
                          to={profile.calorieGoalOverride || profile.calorieGoal}
                          duration={1.2}
                        />{" "}
                        <span className="text-base font-normal text-ink-500">
                          kcal
                        </span>
                      </p>

                      <p className="text-[11px] text-forest-600 mt-1.5">
                        Personalized estimate based on your goals and biometrics.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm"
                    >
                      Edit Profile
                    </button>

                    <button
                      type="button"
                      onClick={redoQuestionnaire}
                      className="w-full bg-cream-100 hover:bg-cream-200 border border-cream-300 text-forest-800 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Questionnaire</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full bg-cream-50 hover:bg-clay-50 border border-clay-200 text-clay-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      Log Out
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold text-ink-900 mb-6">
                    Biometrics & Preferences
                  </h2>

                  <div className="divide-y divide-cream-200 text-sm">
                    {/* Height */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-forest-700">
                        <Ruler className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Height:{" "}
                        <strong className="text-ink-900">
                          {profile.height ? `${profile.height} cm` : "Not specified"}
                        </strong>
                      </p>
                    </div>

                    {/* Weight */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-forest-700">
                        <Scale className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Weight:{" "}
                        <strong className="text-ink-900">
                          {profile.weight ? `${profile.weight} kg` : "Not specified"}
                        </strong>
                      </p>
                    </div>

                    {/* Age */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-forest-700">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Age:{" "}
                        <strong className="text-ink-900">
                          {profile.age || "Not specified"}
                        </strong>
                      </p>
                    </div>

                    {/* Lifestyle */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-forest-700">
                        <Activity className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Activity Level:{" "}
                        <strong className="text-ink-900">
                          {profile.lifestyle || "Not specified"}
                        </strong>
                      </p>
                    </div>

                    {/* Goals */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-clay-600">
                        <Target className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Health Goals:{" "}
                        <strong className="text-ink-900">
                          {profile.healthGoals?.join(", ") || "Balanced Diet"}
                        </strong>
                      </p>
                    </div>

                    {/* Diet */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-forest-700">
                        <Apple className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Diet Preference:{" "}
                        <strong className="text-ink-900">
                          {profile.dietaryPreferences || "Standard"}
                        </strong>
                      </p>
                    </div>

                    {/* Allergies */}
                    <div className="flex items-center gap-3.5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 text-amber-600">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <p className="text-ink-600">
                        Allergies:{" "}
                        <strong className="text-ink-900">
                          {profile.allergies?.length
                            ? profile.allergies.join(", ")
                            : "None reported"}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT FORM */
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-900">
                    Edit Profile Details
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-500 mt-1">
                    Keep your biometrics and dietary preferences up to date.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                  />
                </div>

                {/* Age, Height, Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="height"
                      value={form.height}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                    />
                  </div>
                </div>

                {/* Gender, Diet, Lifestyle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                      Diet Preference
                    </label>
                    <select
                      name="dietaryPreferences"
                      value={form.dietaryPreferences}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                    >
                      <option value="">Select diet</option>
                      {DIETARY_PREFERENCES.map((diet) => (
                        <option key={diet} value={diet}>
                          {diet}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
                      Lifestyle Activity
                    </label>
                    <select
                      name="lifestyle"
                      value={form.lifestyle}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-cream-100 border border-cream-300 text-ink-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 text-sm"
                    >
                      <option value="">Select lifestyle</option>
                      {LIFESTYLES.map((lifestyle) => (
                        <option key={lifestyle} value={lifestyle}>
                          {lifestyle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Allergies Multi-select */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-700 mb-2">
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map((allergy) => {
                      const selected = (form.allergies || []).includes(allergy);
                      return (
                        <button
                          type="button"
                          key={allergy}
                          onClick={() => toggleMulti("allergies", allergy)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-clay-500 border-clay-600 text-white shadow-sm"
                              : "bg-cream-100 border-cream-300 text-ink-700 hover:border-forest-300"
                          }`}
                        >
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Health Goals Multi-select */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-700 mb-2">
                    Health Goals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_GOALS.map((goal) => {
                      const selected = (form.healthGoals || []).includes(goal);
                      return (
                        <button
                          type="button"
                          key={goal}
                          onClick={() => toggleMulti("healthGoals", goal)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-forest-700 border-forest-800 text-white shadow-sm"
                              : "bg-cream-100 border-cream-300 text-ink-700 hover:border-forest-300"
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-cream-200">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 bg-forest-700 hover:bg-forest-800 text-white py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm transition-colors"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex-1 bg-cream-100 hover:bg-cream-200 border border-cream-300 text-ink-700 py-3 rounded-xl disabled:opacity-50 font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </SpotlightCard>
        </FadeContent>
      </div>
    </div>
  );
}
