import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

import api from "../api/api";
import { saveAuth, getUser } from "../utils/auth";

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

      // Store token + user using the existing auth utility.
      saveAuth(data.token, data.user, rememberMe);

      /*
       * Questionnaire is an onboarding step.
       * If the user has not completed it, send them there first.
       */
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* BRAND */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-3xl font-bold text-green-700"
          >
            <span className="text-4xl">🌿</span>
            Dietly
          </Link>

          <p className="mt-2 text-gray-600">
            Welcome back! Let's get you eating better.
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Sign in
            </h1>

            <p className="text-gray-500 mt-1">
              Access your personalized nutrition dashboard.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* NOTICE */}
          {notice && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-12 py-3.5 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="w-4 h-4 accent-green-600"
                  disabled={loading}
                />

                Remember me
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-semibold text-green-700 hover:text-green-800"
              >
                Forgot password?
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3.5 transition"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* REGISTER */}
          <p className="text-center text-sm text-gray-600 mt-7">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-green-700 hover:text-green-800"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}