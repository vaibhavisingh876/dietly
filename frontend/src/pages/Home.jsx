import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
      navigate("/analyze");
      return;
    }

    navigate("/register");
  };

  return (
    <div className="w-full min-h-screen bg-cream-100">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center text-center bg-forest-700 px-6 pt-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #FAF7F2 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-3xl relative">
          <div className="inline-flex items-center justify-center bg-forest-600/60 border border-forest-500 p-4 rounded-2xl mb-8">
            <Leaf className="w-10 h-10 text-clay-300" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold text-cream-50 mb-6 leading-[1.05]">
            Feed your ambition,
            <br />
            not just your appetite.
          </h1>

          <p className="max-w-xl mx-auto text-forest-100 text-lg leading-relaxed mb-10">
            Dietly is your personal AI meal companion — describe what you
            ate, and understand your nutrition, your habits, and your
            progress in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-2 bg-clay-500 text-white px-7 py-3.5 rounded-lg font-medium hover:bg-clay-400 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="border border-forest-400 text-cream-100 px-7 py-3.5 rounded-lg font-medium hover:bg-forest-600 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 bg-cream-100 px-6 md:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-clay-600 font-medium mb-3">
              Why Dietly
            </p>

            <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-800 mb-6 leading-tight">
              Understand your food, not just your calories.
            </h2>

            <p className="text-ink-600 leading-relaxed mb-5">
              Dietly turns a simple meal description into useful nutritional
              information using AI. Instead of manually searching for every
              ingredient, you can simply describe your meal and get an
              estimated nutritional breakdown.
            </p>

            <p className="text-ink-600 leading-relaxed mb-5">
              Your profile, dietary preferences, allergies, health goals, and
              lifestyle can be used to make the feedback more relevant to you.
            </p>

            <p className="text-ink-600 leading-relaxed">
              From meal analysis and calorie tracking to pantry-based recipe
              suggestions and meal history, Dietly brings your everyday
              nutrition workflow into one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-cream-50 rounded-xl p-7 border border-cream-300">
              <Sparkles className="w-8 h-8 text-clay-500 mb-4" />

              <h3 className="font-display text-lg font-semibold text-forest-800 mb-2">
                AI Analysis
              </h3>

              <p className="text-ink-500 text-sm leading-relaxed">
                Describe your meal and receive an estimated nutrition report.
              </p>
            </div>

            <div className="bg-cream-50 rounded-xl p-7 border border-cream-300">
              <BarChart3 className="w-8 h-8 text-clay-500 mb-4" />

              <h3 className="font-display text-lg font-semibold text-forest-800 mb-2">
                Track Progress
              </h3>

              <p className="text-ink-500 text-sm leading-relaxed">
                Monitor calories, macros, streaks, and your meal history.
              </p>
            </div>

            <div className="bg-cream-50 rounded-xl p-7 border border-cream-300">
              <Utensils className="w-8 h-8 text-clay-500 mb-4" />

              <h3 className="font-display text-lg font-semibold text-forest-800 mb-2">
                Smart Pantry
              </h3>

              <p className="text-ink-500 text-sm leading-relaxed">
                Use ingredients you already have to discover meal ideas.
              </p>
            </div>

            <div className="bg-cream-50 rounded-xl p-7 border border-cream-300">
              <Target className="w-8 h-8 text-clay-500 mb-4" />

              <h3 className="font-display text-lg font-semibold text-forest-800 mb-2">
                Personal Goals
              </h3>

              <p className="text-ink-500 text-sm leading-relaxed">
                Keep nutrition tracking aligned with your health goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 bg-cream-50 px-6 md:px-8 border-y border-cream-300"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-clay-600 font-medium mb-3">
            Everything in one place
          </p>

          <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-800 mb-12">
            Powerful features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-cream-100 p-8 rounded-xl border border-cream-300 text-left hover:border-forest-300 transition-colors duration-300"
              >
                <div className="text-forest-600 mb-5">
                  {feature.icon}
                </div>

                <h3 className="font-display text-lg font-semibold mb-2 text-forest-800">
                  {feature.title}
                </h3>

                <p className="text-ink-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-cream-100 px-6 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-forest-800 mb-14">
            How Dietly works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            <div className="text-left md:text-center">
              <div className="font-display w-11 h-11 rounded-full border-2 border-clay-500 text-clay-600 flex items-center justify-center mx-0 md:mx-auto mb-5 text-lg font-semibold">
                1
              </div>

              <h3 className="font-display text-lg font-semibold mb-2 text-forest-800">
                Build your profile
              </h3>

              <p className="text-ink-500 leading-relaxed">
                Tell Dietly about your dietary preferences, goals, allergies,
                and lifestyle.
              </p>
            </div>

            <div className="text-left md:text-center">
              <div className="font-display w-11 h-11 rounded-full border-2 border-clay-500 text-clay-600 flex items-center justify-center mx-0 md:mx-auto mb-5 text-lg font-semibold">
                2
              </div>

              <h3 className="font-display text-lg font-semibold mb-2 text-forest-800">
                Log your meals
              </h3>

              <p className="text-ink-500 leading-relaxed">
                Describe what you ate and let AI estimate the nutritional
                information.
              </p>
            </div>

            <div className="text-left md:text-center">
              <div className="font-display w-11 h-11 rounded-full border-2 border-clay-500 text-clay-600 flex items-center justify-center mx-0 md:mx-auto mb-5 text-lg font-semibold">
                3
              </div>

              <h3 className="font-display text-lg font-semibold mb-2 text-forest-800">
                Improve consistently
              </h3>

              <p className="text-ink-500 leading-relaxed">
                Use your history, calories, macros, streaks, and feedback to
                make better decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <footer className="bg-forest-800 text-forest-200 py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-clay-400" />

              <span className="font-display text-xl font-semibold text-cream-50">
                Dietly
              </span>
            </div>

            <p className="text-forest-300 text-sm leading-relaxed">
              Feed your ambition, not just your appetite.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-cream-50 mb-4">
              Product
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollTo("features")}
                  className="hover:text-cream-50 transition-colors"
                >
                  Features
                </button>
              </li>

              <li>
                <button
                  onClick={handleGetStarted}
                  className="hover:text-cream-50 transition-colors"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-cream-50 mb-4">
              Company
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollTo("about")}
                  className="hover:text-cream-50 transition-colors"
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollTo("features")}
                  className="hover:text-cream-50 transition-colors"
                >
                  Our Features
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-cream-50 mb-4">
              Dietly
            </h4>

            <p className="text-sm text-forest-300 leading-relaxed">
              AI-powered nutrition tracking with personalized insights.
            </p>
          </div>
        </div>

        <div className="border-t border-forest-700 pt-6 text-center text-sm text-forest-400">
          © 2026 Dietly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}