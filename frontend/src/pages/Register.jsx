import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Leaf,
  Loader2,
} from "lucide-react";

import api from "../api/api";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password: form.password,
      });

      const data = response?.data;

      if (!data?.success) {
        throw new Error(
          data?.message || "Registration failed. Please try again."
        );
      }

      navigate("/login?registered=true", {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dietly-page-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <FadeContent delay={0.05}>
          {/* BRAND */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 font-display text-3xl font-bold text-forest-800 tracking-tight"
            >
              <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700">
                <Leaf className="w-5 h-5 text-forest-600" />
              </div>
              <span>Dietly</span>
            </Link>

            <p className="mt-2 text-ink-600 text-sm">
              Start your mindful, AI-powered nutrition journey today.
            </p>
          </div>

          {/* CARD */}
          <SpotlightCard
            className="p-8 shadow-sm border-cream-300"
            spotlightColor="rgba(79, 115, 69, 0.12)"
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                Create your account
              </h1>

              <p className="text-ink-500 text-xs sm:text-sm mt-1">
                Set up your profile in under two minutes.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="w-full rounded-xl border border-cream-300 bg-cream-100/70 pl-10 pr-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-cream-300 bg-cream-100/70 pl-10 pr-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-cream-300 bg-cream-100/70 pl-10 pr-11 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 p-0.5"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-cream-300 bg-cream-100/70 pl-10 pr-11 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 p-0.5"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:bg-forest-300 text-white font-semibold py-3 text-sm transition-colors shadow-sm mt-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <p className="text-center text-xs sm:text-sm text-ink-600 mt-6 pt-5 border-t border-cream-200">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-bold text-clay-600 hover:text-clay-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </SpotlightCard>
        </FadeContent>
      </div>
    </div>
  );
}
