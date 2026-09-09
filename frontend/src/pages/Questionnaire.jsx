import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import api from "../api/api";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";

// --------------------------------------------------
// INTRO
// --------------------------------------------------
const QuizIntro = ({ onNext }) => (
  <div className="min-h-screen dietly-page-bg flex items-center justify-center p-4">
    <FadeContent delay={0.05} className="max-w-md w-full">
      <SpotlightCard
        className="shadow-sm border-cream-300 overflow-hidden"
        spotlightColor="rgba(79, 115, 69, 0.12)"
      >
        <div className="relative h-60 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop"
            alt="Healthy meal spread"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 to-transparent" />
          <div className="absolute top-4 left-4 bg-cream-50/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-cream-200">
            <span className="text-forest-700 font-bold text-sm font-display">
              Dietly Onboarding
            </span>
          </div>
        </div>

        <div className="p-7 text-center sm:text-left">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-2.5 tracking-tight">
            Personalize your nutrition
          </h1>

          <p className="text-ink-600 text-sm leading-relaxed mb-8">
            A few quick questions so Dietly can automatically calculate your daily calorie targets, customize AI meal feedback, and suggest recipes.
          </p>

          <button
            type="button"
            onClick={onNext}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
          >
            <span>Start Quick Setup</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </SpotlightCard>
    </FadeContent>
  </div>
);

// --------------------------------------------------
// SINGLE SELECT
// --------------------------------------------------
const SingleSelectQuestion = ({
  question,
  currentStep,
  totalSteps,
  value,
  onNext,
  onPrev,
  isLast,
}) => {
  const [selected, setSelected] = useState(value ?? null);
  const prefersReducedMotion = useReducedMotion();

  const handleNext = () => {
    if (selected !== null) {
      onNext(selected);
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen dietly-page-bg flex items-center justify-center p-4">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full"
      >
        <SpotlightCard
          className="p-7 sm:p-8 shadow-sm border-cream-300"
          spotlightColor="rgba(79, 115, 69, 0.12)"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-xs font-semibold text-ink-400">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="w-full bg-cream-200 rounded-full h-1.5 mb-6 overflow-hidden">
              <motion.div
                className="bg-forest-600 h-full rounded-full"
                initial={prefersReducedMotion ? false : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{question.icon}</span>
              <h2 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                {question.title}
              </h2>
            </div>

            <p className="text-ink-500 text-xs sm:text-sm">
              {question.subtitle}
            </p>
          </div>

          <div className="space-y-2.5 mb-8">
            {question.options.map((option, index) => {
              const isChosen = selected === index;
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isChosen
                      ? "border-forest-600 bg-forest-50/90 text-forest-900 shadow-sm"
                      : "border-cream-300 bg-cream-100/50 hover:border-forest-300 text-ink-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-sm sm:text-base">
                      {option.label}
                    </span>
                  </div>
                  {isChosen && (
                    <div className="w-5 h-5 rounded-full bg-forest-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={onPrev}
                className="flex-1 border border-cream-300 bg-cream-100 text-ink-700 font-semibold py-3 rounded-xl hover:bg-cream-200 transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={selected === null}
              className={`flex-1 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm shadow-sm ${
                selected === null
                  ? "bg-cream-300 text-ink-400 cursor-not-allowed"
                  : "bg-forest-700 hover:bg-forest-800 text-white"
              }`}
            >
              <span>{isLast ? "Complete Setup" : "Next Step"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};

// --------------------------------------------------
// MULTI SELECT
// --------------------------------------------------
const MultiSelectQuestion = ({
  question,
  currentStep,
  totalSteps,
  value,
  onNext,
  onPrev,
  required = false,
}) => {
  const [selected, setSelected] = useState(value ?? []);
  const [touched, setTouched] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const toggle = (index) => {
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleNext = () => {
    setTouched(true);
    if (required && selected.length === 0) {
      return;
    }
    onNext(selected);
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isInvalid = required && touched && selected.length === 0;

  return (
    <div className="min-h-screen dietly-page-bg flex items-center justify-center p-4">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full"
      >
        <SpotlightCard
          className="p-7 sm:p-8 shadow-sm border-cream-300"
          spotlightColor="rgba(79, 115, 69, 0.12)"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-xs font-semibold text-ink-400">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="w-full bg-cream-200 rounded-full h-1.5 mb-6 overflow-hidden">
              <motion.div
                className="bg-forest-600 h-full rounded-full"
                initial={prefersReducedMotion ? false : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{question.icon}</span>
              <h2 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                {question.title}
              </h2>
            </div>

            <p className="text-ink-500 text-xs sm:text-sm">
              {question.subtitle}
            </p>
          </div>

          <div className="space-y-2.5 mb-4">
            {question.options.map((option, index) => {
              const isChosen = selected.includes(index);
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => toggle(index)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isChosen
                      ? "border-forest-600 bg-forest-50/90 text-forest-900 shadow-sm"
                      : "border-cream-300 bg-cream-100/50 hover:border-forest-300 text-ink-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-sm sm:text-base">
                      {option.label}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isChosen
                        ? "bg-forest-600 border-forest-600 text-white"
                        : "border-cream-300 bg-cream-50"
                    }`}
                  >
                    {isChosen && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {required && (
            <p
              className={`text-xs mb-6 font-medium ${
                isInvalid ? "text-red-500" : "text-ink-400"
              }`}
            >
              Please choose at least one option to continue.
            </p>
          )}

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={onPrev}
                className="flex-1 border border-cream-300 bg-cream-100 text-ink-700 font-semibold py-3 rounded-xl hover:bg-cream-200 transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={required && selected.length === 0}
              className={`flex-1 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm shadow-sm ${
                required && selected.length === 0
                  ? "bg-cream-300 text-ink-400 cursor-not-allowed"
                  : "bg-forest-700 hover:bg-forest-800 text-white"
              }`}
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};

// --------------------------------------------------
// BASIC BIOMETRICS INFO
// --------------------------------------------------
const BasicInfoQuestion = ({
  currentStep,
  totalSteps,
  value,
  onNext,
  onPrev,
}) => {
  const [form, setForm] = useState(
    value ?? {
      age: "",
      height: "",
      weight: "",
      gender: "",
    }
  );

  const [touched, setTouched] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isValid =
    Number(form.age) > 0 &&
    Number(form.age) <= 120 &&
    Number(form.height) > 0 &&
    Number(form.weight) > 0 &&
    Boolean(form.gender);

  const handleNext = () => {
    setTouched(true);
    if (isValid) {
      onNext(form);
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen dietly-page-bg flex items-center justify-center p-4">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full"
      >
        <SpotlightCard
          className="p-7 sm:p-8 shadow-sm border-cream-300"
          spotlightColor="rgba(79, 115, 69, 0.12)"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-xs font-semibold text-ink-400">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="w-full bg-cream-200 rounded-full h-1.5 mb-6 overflow-hidden">
              <motion.div
                className="bg-forest-600 h-full rounded-full"
                initial={prefersReducedMotion ? false : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📋</span>
              <h2 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
                Tell us about you
              </h2>
            </div>

            <p className="text-ink-500 text-xs sm:text-sm">
              We calculate a medically reasonable daily calorie goal from these biometrics.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-ink-500 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 28"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full p-3 rounded-xl border border-cream-300 bg-cream-100/60 focus:border-forest-500 focus:ring-2 focus:ring-forest-100 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-ink-500 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 175"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full p-3 rounded-xl border border-cream-300 bg-cream-100/60 focus:border-forest-500 focus:ring-2 focus:ring-forest-100 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-ink-500 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 70"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full p-3 rounded-xl border border-cream-300 bg-cream-100/60 focus:border-forest-500 focus:ring-2 focus:ring-forest-100 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-ink-500 mb-1">
                Gender Identity
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full p-3 rounded-xl border border-cream-300 bg-cream-100/60 focus:border-forest-500 focus:ring-2 focus:ring-forest-100 outline-none text-sm font-medium"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {touched && !isValid && (
              <p className="text-red-500 text-xs font-medium">
                Please provide valid positive numbers for age, height, weight, and select a gender.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={onPrev}
                className="flex-1 border border-cream-300 bg-cream-100 text-ink-700 font-semibold py-3 rounded-xl hover:bg-cream-200 transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm bg-forest-700 hover:bg-forest-800 text-white shadow-sm"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};

// --------------------------------------------------
// RESULTS
// --------------------------------------------------
const Results = ({
  summaryLines,
  saving,
  saveError,
  onGoToApp,
  onRetry,
}) => (
  <div className="min-h-screen dietly-page-bg flex items-center justify-center p-4">
    <FadeContent delay={0.05} className="max-w-md w-full">
      <SpotlightCard
        className="p-7 sm:p-8 shadow-sm border-cream-300"
        spotlightColor="rgba(79, 115, 69, 0.12)"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-forest-100 border border-forest-200 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
            {saveError ? "⚠️" : "🎉"}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-1.5 tracking-tight">
            {saveError ? "Could not save profile" : "Profile Setup Complete!"}
          </h1>

          <p className="text-ink-600 text-xs sm:text-sm">
            {saveError
              ? "Your selections are preserved. Please retry saving your profile."
              : "Your preferences are saved and will now personalize your meal logs, calorie targets, and recipe recommendations."}
          </p>
        </div>

        <div className="bg-forest-50/70 border border-forest-100 rounded-2xl p-5 mb-6">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-forest-800 mb-3">
            Summary of Your Profile:
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-ink-700">
            {summaryLines.map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-forest-600 font-bold shrink-0">✓</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
            {saveError}
          </div>
        )}

        {saveError ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={saving}
            className="w-full bg-clay-600 hover:bg-clay-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{saving ? "Saving..." : "Retry Save"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToApp}
            disabled={saving}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{saving ? "Saving profile..." : "Enter Dietly Dashboard"}</span>
          </button>
        )}
      </SpotlightCard>
    </FadeContent>
  </div>
);

// --------------------------------------------------
// MAIN QUESTIONNAIRE LOGIC
// --------------------------------------------------
function QuestionnaireLogic() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("intro");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [answers, setAnswers] = useState({});

  const dietQuestion = {
    title: "Dietary Preference",
    subtitle: "Select the option that best reflects your eating habits",
    icon: "🍽️",
    options: [
      { icon: "🥗", label: "Vegetarian" },
      { icon: "🥩", label: "Non-Vegetarian" },
      { icon: "🌱", label: "Vegan" },
      { icon: "🐟", label: "Pescatarian" },
    ],
  };

  const allergyQuestion = {
    title: "Allergies & Intolerances",
    subtitle: "Select all that apply — Dietly will flag these in all meal analyses",
    icon: "⚠️",
    options: [
      { icon: "🌾", label: "Gluten" },
      { icon: "🥛", label: "Dairy" },
      { icon: "🥚", label: "Eggs" },
      { icon: "🐟", label: "Fish" },
    ],
  };

  const goalQuestion = {
    title: "Health & Body Goals",
    subtitle: "Choose your primary nutritional objectives",
    icon: "🎯",
    options: [
      { icon: "⚖️", label: "Weight Loss" },
      { icon: "💪", label: "More Energy" },
      { icon: "🧘", label: "Muscle Gain" },
      { icon: "🥗", label: "Balanced Diet" },
      { icon: "🛡️", label: "Better Sleep" },
      { icon: "😌", label: "Stress Relief" },
    ],
  };

  const lifestyleQuestion = {
    title: "Daily Activity Level",
    subtitle: "Helps calibrate your base metabolic energy expenditure",
    icon: "🏃",
    options: [
      { icon: "🪑", label: "Sedentary" },
      { icon: "🚶", label: "Moderate" },
      { icon: "🏋️", label: "Active" },
      { icon: "⚡", label: "Very Active" },
    ],
  };

  const totalSteps = 5;

  const goNext = (key, value) => {
    const updatedAnswers = {
      ...answers,
      [key]: value,
    };
    setAnswers(updatedAnswers);

    if (step < totalSteps - 1) {
      setStep((current) => current + 1);
    } else {
      finish(updatedAnswers);
    }
  };

  const goPrev = () => {
    setStep((current) => Math.max(0, current - 1));
  };

  const finish = async (finalAnswers) => {
    setCurrentPage("results");
    setSaving(true);
    setSaveError(null);

    const basic = finalAnswers.basic || {};
    const dietaryPreferences = dietQuestion.options[finalAnswers.diet]?.label;
    const allergies = (finalAnswers.allergies || []).map(
      (index) => allergyQuestion.options[index].label
    );
    const healthGoals = (finalAnswers.goals || []).map(
      (index) => goalQuestion.options[index].label
    );
    const lifestyle = lifestyleQuestion.options[finalAnswers.lifestyle]?.label;

    try {
      await api.put("/auth/profile", {
        age: Number(basic.age),
        height: Number(basic.height),
        weight: Number(basic.weight),
        gender: basic.gender,
        dietaryPreferences,
        allergies,
        healthGoals,
        lifestyle,
      });

      window.dispatchEvent(new Event("authChanged"));
    } catch (err) {
      console.error("Failed to save questionnaire:", err);
      setSaveError(
        err?.response?.data?.message ||
          "Failed to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGoToApp = () => {
    navigate("/analyze", { replace: true });
  };

  const summaryLines = [
    finalSafe(
      answers.basic
        ? `${answers.basic.age} yrs, ${answers.basic.height}cm, ${answers.basic.weight}kg, ${answers.basic.gender}`
        : null
    ),
    typeof answers.diet === "number"
      ? dietQuestion.options[answers.diet].label
      : null,
    (answers.allergies || []).length
      ? `Allergies: ${answers.allergies
          .map((i) => allergyQuestion.options[i].label)
          .join(", ")}`
      : "No allergies",
    (answers.goals || []).length
      ? `Goals: ${answers.goals
          .map((i) => goalQuestion.options[i].label)
          .join(", ")}`
      : null,
    typeof answers.lifestyle === "number"
      ? `Lifestyle: ${lifestyleQuestion.options[answers.lifestyle].label}`
      : null,
  ].filter(Boolean);

  if (currentPage === "intro") {
    return <QuizIntro onNext={() => setCurrentPage("quiz")} />;
  }

  if (currentPage === "quiz") {
    if (step === 0) {
      return (
        <BasicInfoQuestion
          currentStep={0}
          totalSteps={totalSteps}
          value={answers.basic}
          onNext={(value) => goNext("basic", value)}
          onPrev={goPrev}
        />
      );
    }

    if (step === 1) {
      return (
        <SingleSelectQuestion
          question={dietQuestion}
          currentStep={1}
          totalSteps={totalSteps}
          value={answers.diet}
          onNext={(value) => goNext("diet", value)}
          onPrev={goPrev}
        />
      );
    }

    if (step === 2) {
      return (
        <MultiSelectQuestion
          question={allergyQuestion}
          currentStep={2}
          totalSteps={totalSteps}
          value={answers.allergies}
          onNext={(value) => goNext("allergies", value)}
          onPrev={goPrev}
          required={false}
        />
      );
    }

    if (step === 3) {
      return (
        <MultiSelectQuestion
          question={goalQuestion}
          currentStep={3}
          totalSteps={totalSteps}
          value={answers.goals}
          onNext={(value) => goNext("goals", value)}
          onPrev={goPrev}
          required={true}
        />
      );
    }

    if (step === 4) {
      return (
        <SingleSelectQuestion
          question={lifestyleQuestion}
          currentStep={4}
          totalSteps={totalSteps}
          value={answers.lifestyle}
          isLast
          onNext={(value) => goNext("lifestyle", value)}
          onPrev={goPrev}
        />
      );
    }
  }

  if (currentPage === "results") {
    return (
      <Results
        summaryLines={summaryLines}
        saving={saving}
        saveError={saveError}
        onGoToApp={handleGoToApp}
        onRetry={() => finish(answers)}
      />
    );
  }

  return null;
}

function finalSafe(value) {
  return value || null;
}

export default QuestionnaireLogic;
