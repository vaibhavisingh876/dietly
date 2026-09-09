import React from "react";
import { useNavigate } from "react-router-dom";
import MoltenMetal from "../components/MoltenMetal.jsx";
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
  ShieldCheck,
  Zap,
} from "lucide-react";
import BlurText from "../components/reactbits/BlurText.jsx";
import ShinyText from "../components/reactbits/ShinyText.jsx";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Apple className="w-7 h-7 text-forest-600" />,
      title: "Smart Meal Analysis",
      description:
        "Describe what you ate in everyday words and get AI-powered nutritional estimates and health insights instantly.",
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-clay-500" />,
      title: "Personalized Feedback",
      description:
        "Get practical nutritional guidance tailored directly to your diet preferences, allergens, and personal health goals.",
    },
    {
      icon: <Target className="w-7 h-7 text-forest-600" />,
      title: "Daily Streak Tracking",
      description:
        "Stay consistent with effortless daily meal logging and watch your healthy eating streaks compound over time.",
    },
    {
      icon: <BarChart3 className="w-7 h-7 text-clay-500" />,
      title: "Macro Tracking",
      description:
        "Accurately monitor calories, protein, carbohydrates, fats, and fiber with intuitive, visual breakdown charts.",
    },
    {
      icon: <Heart className="w-7 h-7 text-forest-600" />,
      title: "Meal History & Trends",
      description:
        "Review your previous meals, spot patterns, and gain a clear understanding of how your eating habits evolve.",
    },
    {
      icon: <Calendar className="w-7 h-7 text-clay-500" />,
      title: "Actionable Insights",
      description:
        "Combine your lifestyle profile and caloric targets to make daily nutrition effortless, joyful, and sustainable.",
    },
  ];

  const stats = [
    {
      value: 12500,
      suffix: "+",
      label: "Meals Analyzed",
      sub: "AI-powered nutritional reports",
    },
    {
      value: 98,
      suffix: "%",
      label: "Precision Feedback",
      sub: "Personalized to user goals",
    },
    {
      value: 14,
      suffix: " Days",
      label: "Average Streak",
      sub: "Sustainable habit formation",
    },
    {
      value: 4.9,
      suffix: "/5",
      decimals: 1,
      label: "User Rating",
      sub: "Loved by mindful eaters",
    },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleGetStarted = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      navigate("/analyze");
      return;
    }

    navigate("/register");
  };

  return (
    <div className="w-full min-h-screen bg-cream-100 overflow-x-hidden">
      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="min-h-[92vh] flex items-center justify-center text-center bg-forest-800 px-6 pt-32 pb-20 relative overflow-hidden">
        {/* Animated MoltenMetal Background */}
        <div className="absolute inset-0 pointer-events-none opacity-80">
          <MoltenMetal
            color1="#032d1f"
            color2="#a0f07b"
            color3="#FAF7F2"
            speed={0.25}
            scale={3.2}
            glow={1.3}
            opacity={0.8}
            mouseInteraction
            mouseStrength={0.2}
          />
        </div>

        {/* Ambient Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/40 via-transparent to-forest-900/70 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-forest-700/70 border border-forest-500/60 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-clay-300 shrink-0" />
            <ShinyText
              text="Intelligent AI Nutrition & Habit Companion"
              speed={4}
              className="text-xs sm:text-sm font-medium tracking-wide text-cream-100"
            />
          </div>

          {/* Animated Heading with BlurText */}
          <div className="mb-6">
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-cream-50 leading-[1.08] tracking-tight">
              Feed your ambition,
              <br />
              <span className="text-clay-300">not just your appetite.</span>
            </h1>
          </div>

          <FadeContent delay={0.2} duration={0.8}>
            <p className="max-w-xl mx-auto text-forest-100/90 text-base sm:text-lg leading-relaxed mb-10 font-normal">
              Dietly is your personal AI meal companion — describe what you
              ate, and understand your nutrition, your habits, and your
              progress in one seamless, thoughtful place.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-clay-500 hover:bg-clay-600 active:bg-clay-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollTo("features")}
                className="w-full sm:w-auto inline-flex items-center justify-center border border-forest-400/80 bg-forest-800/40 hover:bg-forest-700/60 text-cream-100 px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5"
              >
                Explore Features
              </button>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* =========================================
          ANIMATED STATISTICS BANNER
      ========================================= */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <SpotlightCard
              key={stat.label}
              className="p-5 sm:p-6 text-center border-cream-300 shadow-md bg-cream-50/95 backdrop-blur-md"
              spotlightColor="rgba(79, 115, 69, 0.12)"
            >
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-800 tracking-tight">
                <CountUp
                  to={stat.value}
                  duration={1.6}
                  delay={0.1 * idx}
                  decimals={stat.decimals || 0}
                />
                <span className="text-clay-500">{stat.suffix}</span>
              </p>
              <p className="font-semibold text-xs sm:text-sm text-ink-800 mt-1.5">
                {stat.label}
              </p>
              <p className="text-[11px] sm:text-xs text-ink-400 mt-0.5 hidden sm:block">
                {stat.sub}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* =========================================
          ABOUT / WHY DIETLY
      ========================================= */}
      <section id="about" className="py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeContent delay={0.1}>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clay-100 border border-clay-200 mb-3">
                <Leaf className="w-3.5 h-3.5 text-clay-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-clay-700">
                  Why Dietly
                </span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-forest-900 mb-6 leading-tight">
                Understand your food, not just your calories.
              </h2>

              <p className="text-ink-600 leading-relaxed mb-5 text-base sm:text-lg">
                Dietly turns simple meal descriptions into comprehensive nutritional
                intelligence using AI. Instead of tediously weighing every ingredient
                or searching messy databases, describe what you enjoyed and let
                Dietly estimate the rest.
              </p>

              <p className="text-ink-600 leading-relaxed mb-6 text-sm sm:text-base">
                Your profile, dietary preferences, allergies, health targets, and
                lifestyle automatically contextualize every analysis — turning raw
                numbers into guidance that genuinely fits your life.
              </p>

              <div className="flex items-center gap-4 text-sm font-medium text-forest-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-forest-600" />
                  <span>Personalized & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-clay-500" />
                  <span>Instant AI breakdown</span>
                </div>
              </div>
            </div>
          </FadeContent>

          {/* 4 Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SpotlightCard
              className="p-6 transition-all duration-200 hover:-translate-y-1"
              spotlightColor="rgba(193, 80, 46, 0.1)"
            >
              <div className="w-12 h-12 rounded-xl bg-clay-100 flex items-center justify-center text-clay-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-forest-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-ink-500 text-sm leading-relaxed">
                Describe your meal naturally and receive an immediate nutrition estimate.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="p-6 transition-all duration-200 hover:-translate-y-1"
              spotlightColor="rgba(79, 115, 69, 0.12)"
            >
              <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-forest-900 mb-2">
                Track Progress
              </h3>
              <p className="text-ink-500 text-sm leading-relaxed">
                Monitor calories, macros, daily streaks, and long-term eating habits.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="p-6 transition-all duration-200 hover:-translate-y-1"
              spotlightColor="rgba(79, 115, 69, 0.12)"
            >
              <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-forest-900 mb-2">
                Smart Pantry
              </h3>
              <p className="text-ink-500 text-sm leading-relaxed">
                Use ingredients already in your kitchen to generate delicious, healthy recipes.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="p-6 transition-all duration-200 hover:-translate-y-1"
              spotlightColor="rgba(193, 80, 46, 0.1)"
            >
              <div className="w-12 h-12 rounded-xl bg-clay-100 flex items-center justify-center text-clay-600 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-forest-900 mb-2">
                Personal Goals
              </h3>
              <p className="text-ink-500 text-sm leading-relaxed">
                Keep daily nutrition aligned with your personal weight, fitness, and energy targets.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* =========================================
          POWERFUL FEATURES
      ========================================= */}
      <section
        id="features"
        className="py-24 bg-cream-50 px-6 md:px-8 border-y border-cream-300"
      >
        <div className="max-w-7xl mx-auto text-center">
          <FadeContent delay={0.1}>
            <p className="text-clay-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Everything In One Place
            </p>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-forest-900 mb-4">
              Designed for your daily rhythm
            </h2>

            <p className="max-w-xl mx-auto text-ink-500 text-base mb-14">
              Intuitive tools built from the ground up to make healthy choices effortless and sustainable.
            </p>
          </FadeContent>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FadeContent key={feature.title} delay={0.08 * idx}>
                <SpotlightCard
                  className="p-8 text-left h-full transition-all duration-200 hover:-translate-y-1 bg-cream-100/70"
                  spotlightColor="rgba(79, 115, 69, 0.12)"
                >
                  <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-2.5 text-forest-900">
                    {feature.title}
                  </h3>

                  <p className="text-ink-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </SpotlightCard>
              </FadeContent>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          HOW DIETLY WORKS
      ========================================= */}
      <section className="py-24 bg-cream-100 px-6 md:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <FadeContent delay={0.1}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-forest-900 mb-4">
              How Dietly works
            </h2>

            <p className="text-ink-500 max-w-lg mx-auto mb-16">
              Three simple steps to mindful eating, guided by intelligence and built for consistency.
            </p>
          </FadeContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <FadeContent delay={0.1}>
              <SpotlightCard className="p-8 text-center h-full border-cream-300">
                <div className="w-12 h-12 rounded-full border-2 border-clay-500 text-clay-600 bg-clay-50 flex items-center justify-center mx-auto mb-5 text-lg font-bold font-display shadow-sm">
                  1
                </div>

                <h3 className="font-display text-xl font-semibold mb-2 text-forest-900">
                  Build your profile
                </h3>

                <p className="text-ink-500 text-sm leading-relaxed">
                  Tell Dietly about your dietary preferences, health goals, allergies,
                  and daily lifestyle.
                </p>
              </SpotlightCard>
            </FadeContent>

            {/* Step 2 */}
            <FadeContent delay={0.2}>
              <SpotlightCard className="p-8 text-center h-full border-cream-300">
                <div className="w-12 h-12 rounded-full border-2 border-clay-500 text-clay-600 bg-clay-50 flex items-center justify-center mx-auto mb-5 text-lg font-bold font-display shadow-sm">
                  2
                </div>

                <h3 className="font-display text-xl font-semibold mb-2 text-forest-900">
                  Log your meals
                </h3>

                <p className="text-ink-500 text-sm leading-relaxed">
                  Describe what you ate in natural language and let AI estimate
                  the accurate nutritional values.
                </p>
              </SpotlightCard>
            </FadeContent>

            {/* Step 3 */}
            <FadeContent delay={0.3}>
              <SpotlightCard className="p-8 text-center h-full border-cream-300">
                <div className="w-12 h-12 rounded-full border-2 border-clay-500 text-clay-600 bg-clay-50 flex items-center justify-center mx-auto mb-5 text-lg font-bold font-display shadow-sm">
                  3
                </div>

                <h3 className="font-display text-xl font-semibold mb-2 text-forest-900">
                  Improve consistently
                </h3>

                <p className="text-ink-500 text-sm leading-relaxed">
                  Use your streak, calories, macros, and personalized feedback to
                  make positive, lasting decisions.
                </p>
              </SpotlightCard>
            </FadeContent>
          </div>

          {/* CTA Banner */}
          <FadeContent delay={0.3} className="mt-16">
            <div className="bg-forest-800 text-cream-50 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-forest-900/60 to-forest-700/60 pointer-events-none" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                  Ready to transform how you eat?
                </h3>
                <p className="text-forest-100 text-sm sm:text-base mb-8">
                  Join mindful eaters taking the stress out of daily nutrition. Start tracking in under 2 minutes.
                </p>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 bg-clay-500 hover:bg-clay-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="bg-forest-900 text-forest-200 py-14 px-6 md:px-8 border-t border-forest-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-forest-800 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-clay-400" />
              </div>
              <span className="font-display text-xl font-bold text-cream-50 tracking-tight">
                Dietly
              </span>
            </div>

            <p className="text-forest-300 text-sm leading-relaxed">
              Feed your ambition, not just your appetite. Your personal AI-powered
              nutrition and meal companion.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-cream-50 text-sm uppercase tracking-wider mb-4">
              Product
            </h4>

            <ul className="space-y-2.5 text-sm">
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
            <h4 className="font-semibold text-cream-50 text-sm uppercase tracking-wider mb-4">
              Company
            </h4>

            <ul className="space-y-2.5 text-sm">
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
                  Our Philosophy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-cream-50 text-sm uppercase tracking-wider mb-4">
              Dietly
            </h4>

            <p className="text-sm text-forest-300 leading-relaxed">
              AI-powered nutrition tracking with personalized health insights. Built with care for sustainable wellness.
            </p>
          </div>
        </div>

        <div className="border-t border-forest-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-400">
          <p>© 2026 Dietly. All rights reserved.</p>
          <p>Designed with natural tones: Forest Green, Cream & Clay.</p>
        </div>
      </footer>
    </div>
  );
}
