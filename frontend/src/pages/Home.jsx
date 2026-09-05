import React from "react";
import {
  Leaf,
  Apple,
  TrendingUp,
  Target,
  BarChart3,
  Heart,
  Calendar,
  Utensils,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Apple className="w-8 h-8" />,
      title: "Smart Meal Analysis",
      description:
        "Describe what you ate and get AI-powered nutritional estimates and health insights.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Personalized Feedback",
      description:
        "Get practical suggestions based on your meal and personal dietary profile.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Daily Streak Tracking",
      description:
        "Stay consistent with daily meal logging and keep your healthy habits going.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Macro Tracking",
      description:
        "Track calories, protein, carbohydrates, fats, and other nutrition information.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Meal History & Progress",
      description:
        "Review your previous meals and understand how your eating habits change over time.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Personalized Health Insights",
      description:
        "Use your profile and goals to make your nutrition tracking more meaningful.",
    },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleGetStarted = () => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      window.location.href = "/analyze";
      return;
    }

    window.location.href = "/register";
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center text-center bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 px-6 pt-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center justify-center bg-white p-5 rounded-3xl shadow-lg mb-8">
            <Leaf className="w-16 h-16 text-green-600" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="text-green-600">Dietly</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 font-medium mb-6">
            Feed Your Ambition, Not Just Your Appetite.
          </p>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed mb-10">
            Your personal AI-powered meal companion to help you understand
            what you eat, track your nutrition, and build healthier habits.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="border-2 border-green-600 text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 bg-gray-50 px-6 md:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-green-600 font-semibold uppercase tracking-wider mb-3">
              Why Dietly?
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Understand your food, not just your calories.
            </h2>

            <p className="text-gray-700 leading-relaxed mb-5">
              Dietly turns a simple meal description into useful nutritional
              information using AI. Instead of manually searching for every
              ingredient, you can simply describe your meal and get an
              estimated nutritional breakdown.
            </p>

            <p className="text-gray-700 leading-relaxed mb-5">
              Your profile, dietary preferences, allergies, health goals, and
              lifestyle can be used to make the feedback more relevant to you.
            </p>

            <p className="text-gray-700 leading-relaxed">
              From meal analysis and calorie tracking to pantry-based recipe
              suggestions and meal history, Dietly brings your everyday
              nutrition workflow into one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl shadow-lg p-7 border border-green-100">
              <Sparkles className="w-10 h-10 text-green-600 mb-4" />

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                AI Analysis
              </h3>

              <p className="text-gray-600">
                Describe your meal and receive an estimated nutrition report.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-7 border border-green-100">
              <BarChart3 className="w-10 h-10 text-green-600 mb-4" />

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Track Progress
              </h3>

              <p className="text-gray-600">
                Monitor calories, macros, streaks, and your meal history.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-7 border border-green-100">
              <Utensils className="w-10 h-10 text-green-600 mb-4" />

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Smart Pantry
              </h3>

              <p className="text-gray-600">
                Use ingredients you already have to discover meal ideas.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-7 border border-green-100">
              <Target className="w-10 h-10 text-green-600 mb-4" />

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Personal Goals
              </h3>

              <p className="text-gray-600">
                Keep nutrition tracking aligned with your health goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 bg-white px-6 md:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-green-600 font-semibold uppercase tracking-wider mb-3">
            Everything in one place
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-green-50 px-6 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
            How Dietly Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold">
                1
              </div>

              <h3 className="text-xl font-bold mb-3">
                Build Your Profile
              </h3>

              <p className="text-gray-600">
                Tell Dietly about your dietary preferences, goals, allergies,
                and lifestyle.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold">
                2
              </div>

              <h3 className="text-xl font-bold mb-3">
                Log Your Meals
              </h3>

              <p className="text-gray-600">
                Describe what you ate and let AI estimate the nutritional
                information.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold">
                3
              </div>

              <h3 className="text-xl font-bold mb-3">
                Improve Consistently
              </h3>

              <p className="text-gray-600">
                Use your history, calories, macros, streaks, and feedback to
                make better decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-7 h-7 text-green-500" />

              <span className="text-2xl font-bold text-white">
                Dietly
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Feed Your Ambition, Not Just Your Appetite.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Product
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollTo("features")}
                  className="hover:text-white transition"
                >
                  Features
                </button>
              </li>

              <li>
                <button
                  onClick={handleGetStarted}
                  className="hover:text-white transition"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Company
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollTo("about")}
                  className="hover:text-white transition"
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollTo("features")}
                  className="hover:text-white transition"
                >
                  Our Features
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Dietly
            </h4>

            <p className="text-sm text-gray-400 leading-relaxed">
              AI-powered nutrition tracking with personalized insights.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          © 2026 Dietly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}