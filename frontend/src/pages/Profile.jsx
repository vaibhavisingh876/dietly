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
} from "lucide-react";
import Nav from "../components/Nav";
import api from "../api/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.user.profile || {});
          setForm(response.data.user.profile || {});
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        "/profile/update",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProfile(response.data.profile);
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
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
    <div className="min-h-screen bg-gray-950 text-white">
      <Nav />

      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <User className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold">{user.email}</h2>
          </div>

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
                <Target className="w-5 h-5 text-blue-400" />
                Goal: {profile.healthGoals || "-"}
              </div>
              <div className="flex items-center gap-3">
                <Apple className="w-5 h-5 text-blue-400" />
                Diet: {profile.dietaryPreferences?.join(", ") || "-"}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3 text-gray-300">
              <input
                type="number"
                name="height"
                placeholder="Height (cm)"
                value={form.height || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={form.weight || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={form.age || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="text"
                name="healthGoals"
                placeholder="Goal (e.g., Weight Loss)"
                value={form.healthGoals || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="text"
                name="dietaryPreferences"
                placeholder="Diet Preferences (comma separated)"
                value={form.dietaryPreferences?.join(", ") || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dietaryPreferences: e.target.value.split(",").map((v) => v.trim()),
                  }))
                }
                className="w-full p-2 rounded bg-gray-700 text-white"
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 py-2 rounded-lg"
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
