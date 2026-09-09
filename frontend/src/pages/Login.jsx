import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Leaf, Loader2 } from "lucide-react";

import api from "../api/api";
import { saveAuth, getUser } from "../utils/auth";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("registered") === "true") {
      setNotice("Account created successfully. Please log in.");
    }
  }, [location.search]);

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
    setNotice("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response?.data;

      if (!data?.success || !data?.token || !data?.user) {
        throw new Error(
          data?.message || "Login failed. Please try again."
        );
      }

      saveAuth({
        token: data.token,
        user: data.user,
        persist: rememberMe,
      });

      const user = data.user || getUser();

      if (user?.questionnaireCompleted === false) {
        navigate("/questionnaire", { replace: true });
      } else {
        navigate("/analyze", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to log in. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setNotice(
      "Password reset is not available yet. Please contact the project administrator."
    );
    setError("");
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
              Welcome back! Log in to access your nutritional insights.
            </p>
          </div>

          {/* CARD */}
          <SpotlightCard
            className="p-8 shadow-sm border-cream-300"
            spotlightColor="rgba(79, 115, 69, 0.12)"
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                Sign in to your account
              </h1>

              <p className="text-ink-500 text-xs sm:text-sm mt-1">
                Access your meals, macros, streaks, and pantry.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* NOTICE */}
            {notice && (
              <div className="mb-5 rounded-xl bg-forest-50 border border-forest-200 px-4 py-3 text-sm text-forest-800 font-medium">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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

              {/* OPTIONS */}
              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm pt-1">
                <label className="flex items-center gap-2 text-ink-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-forest-600 accent-forest-600 focus:ring-forest-500"
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-semibold text-forest-700 hover:text-forest-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:bg-forest-300 text-white font-semibold py-3 text-sm transition-colors shadow-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* REGISTER LINK */}
            <p className="text-center text-xs sm:text-sm text-ink-600 mt-6 pt-5 border-t border-cream-200">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="font-bold text-clay-600 hover:text-clay-700 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </SpotlightCard>
        </FadeContent>
      </div>
    </div>
  );
}
