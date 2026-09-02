import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// Quiz Intro
const QuizIntro = ({ onNext }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
      <div className="relative h-64">
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop"
          alt="Healthy meal spread"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full shadow-md">
          <span className="text-emerald-600 font-bold text-lg">Dietly</span>
        </div>
      </div>

      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Bite into Your Perfect Meal
        </h1>
        <p className="text-gray-600 mb-8">
          A few quick questions so Dietly can personalize your calorie goal, meal feedback, and recipes.
        </p>

        <button
          onClick={onNext}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-full transition-colors shadow-lg"
        >
          Start Now →
        </button>
      </div>
    </div>
  </div>
);

// A single-select question screen
const SingleSelectQuestion = ({ question, currentStep, totalSteps, value, onNext, onPrev, isLast }) => {
  const [selected, setSelected] = useState(value ?? null);

  const handleNext = () => {
    if (selected !== null) onNext(selected);
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">{question.icon}</span>
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="text-emerald-600 font-semibold text-sm tracking-wide">QUESTIONNAIRE</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Question {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">{question.title}</h2>
          <p className="text-gray-600 text-sm">{question.subtitle}</p>
        </div>

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                selected === index
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-200'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={onPrev}
              className="flex-1 border-2 border-emerald-500 text-emerald-600 font-semibold py-3 rounded-full hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> PREV
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={selected === null}
            className={`flex-1 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 ${
              selected === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isLast ? 'NEXT' : 'NEXT'} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// A multi-select question screen ("select all that apply")
const MultiSelectQuestion = ({ question, currentStep, totalSteps, value, onNext, onPrev }) => {
  const [selected, setSelected] = useState(value ?? []);

  const toggle = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">{question.icon}</span>
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="text-emerald-600 font-semibold text-sm tracking-wide">QUESTIONNAIRE</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Question {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">{question.title}</h2>
          <p className="text-gray-600 text-sm">{question.subtitle}</p>
        </div>

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => toggle(index)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                selected.includes(index)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-200'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={onPrev}
              className="flex-1 border-2 border-emerald-500 text-emerald-600 font-semibold py-3 rounded-full hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> PREV
            </button>
          )}

          <button
            onClick={() => onNext(selected)}
            className="flex-1 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            NEXT <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Basic info screen (age / height / weight / gender) — these were previously
// collected nowhere in the app at all.
const BasicInfoQuestion = ({ currentStep, totalSteps, value, onNext, onPrev }) => {
  const [form, setForm] = useState(value ?? { age: '', height: '', weight: '', gender: '' });
  const [touched, setTouched] = useState(false);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const isValid =
    form.age && form.height && form.weight && form.gender &&
    form.age > 0 && form.age <= 120 && form.height > 0 && form.weight > 0;

  const handleNext = () => {
    setTouched(true);
    if (isValid) onNext(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
          </div>
          <div className="text-center mb-2">
            <span className="text-emerald-600 font-semibold text-sm tracking-wide">QUESTIONNAIRE</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Question {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about you</h2>
          <p className="text-gray-600 text-sm">This helps us estimate a sensible daily calorie goal.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none"
            />
            <input
              type="number"
              placeholder="Height (cm)"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              className="p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none"
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none"
            />
          </div>

          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none bg-white"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {touched && !isValid && (
            <p className="text-red-500 text-sm">Please fill in all fields with valid values.</p>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={onPrev}
              className="flex-1 border-2 border-emerald-500 text-emerald-600 font-semibold py-3 rounded-full hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> PREV
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            NEXT <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Results
const Results = ({ summaryLines, saving, saveError, onGoToApp }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Your Profile is Set Up</h1>
        <p className="text-gray-600">
          We've saved your preferences and will use them to personalize your meal analysis, calorie goal, and recipes.
        </p>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Your Preferences:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          {summaryLines.map((line, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-emerald-600">✓</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {saveError}
        </div>
      )}

      <button
        onClick={onGoToApp}
        disabled={saving}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
        {saving ? 'Saving...' : 'Go to Dashboard'}
      </button>
    </div>
  </div>
);

function QuestionnaireLogic() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('intro');
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // answers[0] = basic info object, answers[1] = diet index, answers[2] =
  // allergy indices (multi), answers[3] = goal indices (multi), answers[4] = lifestyle index
  const [answers, setAnswers] = useState({});

  const dietQuestion = {
    title: "What's your diet preference?",
    subtitle: 'Select the one that best describes you',
    icon: '🍽️',
    options: [
      { icon: '🥗', label: 'Vegetarian' },
      { icon: '🥩', label: 'Non-Vegetarian' },
      { icon: '🌱', label: 'Vegan' },
      { icon: '🐟', label: 'Pescatarian' },
    ],
  };

  const allergyQuestion = {
    title: 'Any food allergies or intolerances?',
    subtitle: "Select all that apply — we'll flag these in your meal analysis",
    icon: '⚠️',
    options: [
      { icon: '🌾', label: 'Gluten' },
      { icon: '🥛', label: 'Dairy' },
      { icon: '🥚', label: 'Eggs' },
      { icon: '🐟', label: 'Fish' },
    ],
  };

  const goalQuestion = {
    title: 'What are your health goals?',
    subtitle: 'Select all that apply to define your journey',
    icon: '🎯',
    options: [
      { icon: '⚖️', label: 'Weight Loss' },
      { icon: '💪', label: 'More Energy' },
      { icon: '🧘', label: 'Muscle Gain' },
      { icon: '🥗', label: 'Balanced Diet' },
      { icon: '🛡️', label: 'Better Sleep' },
      { icon: '😌', label: 'Stress Relief' },
    ],
  };

  const lifestyleQuestion = {
    title: 'How would you describe your lifestyle?',
    subtitle: 'Help us calibrate your activity to recommendations',
    icon: '🏃',
    options: [
      { icon: '🪑', label: 'Sedentary' },
      { icon: '🚶', label: 'Moderate' },
      { icon: '🏋️', label: 'Active' },
      { icon: '⚡', label: 'Very Active' },
    ],
  };

  const totalSteps = 5; // basic info, diet, allergies, goals, lifestyle

  const goNext = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      finish({ ...answers, [key]: value });
    }
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const finish = async (finalAnswers) => {
    setCurrentPage('results');
    setSaving(true);
    setSaveError(null);

    const basic = finalAnswers.basic || {};
    const dietaryPreferences = dietQuestion.options[finalAnswers.diet]?.label;
    const allergies = (finalAnswers.allergies || []).map((i) => allergyQuestion.options[i].label);
    const healthGoals = (finalAnswers.goals || []).map((i) => goalQuestion.options[i].label);
    const lifestyle = lifestyleQuestion.options[finalAnswers.lifestyle]?.label;

    try {
      await api.put('/auth/profile', {
        age: Number(basic.age),
        height: Number(basic.height),
        weight: Number(basic.weight),
        gender: basic.gender,
        dietaryPreferences,
        allergies,
        healthGoals,
        lifestyle,
      });
    } catch (err) {
      console.error('Failed to save questionnaire:', err);
      setSaveError(
        err.response?.data?.message || 'Failed to save your profile. You can update it later from the Profile page.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGoToApp = () => {
    navigate('/analyze');
  };

  const summaryLines = [
    answers.basic ? `${answers.basic.age} yrs, ${answers.basic.height}cm, ${answers.basic.weight}kg, ${answers.basic.gender}` : null,
    typeof answers.diet === 'number' ? dietQuestion.options[answers.diet].label : null,
    (answers.allergies || []).length
      ? `Allergies: ${answers.allergies.map((i) => allergyQuestion.options[i].label).join(', ')}`
      : 'No allergies',
    (answers.goals || []).length
      ? `Goals: ${answers.goals.map((i) => goalQuestion.options[i].label).join(', ')}`
      : null,
    typeof answers.lifestyle === 'number' ? `Lifestyle: ${lifestyleQuestion.options[answers.lifestyle].label}` : null,
  ].filter(Boolean);

  if (currentPage === 'intro') {
    return <QuizIntro onNext={() => setCurrentPage('quiz')} />;
  }

  if (currentPage === 'quiz') {
    if (step === 0) {
      return (
        <BasicInfoQuestion
          currentStep={0}
          totalSteps={totalSteps}
          value={answers.basic}
          onNext={(value) => goNext('basic', value)}
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
          onNext={(value) => goNext('diet', value)}
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
          onNext={(value) => goNext('allergies', value)}
          onPrev={goPrev}
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
          onNext={(value) => goNext('goals', value)}
          onPrev={goPrev}
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
          onNext={(value) => goNext('lifestyle', value)}
          onPrev={goPrev}
        />
      );
    }
  }

  if (currentPage === 'results') {
    return (
      <Results
        summaryLines={summaryLines}
        saving={saving}
        saveError={saveError}
        onGoToApp={handleGoToApp}
      />
    );
  }

  return null;
}

export default QuestionnaireLogic;