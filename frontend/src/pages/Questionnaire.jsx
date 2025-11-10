import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Quiz Intro Component
const QuizIntro = ({ onNext }) => {
  return (
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
            Take our quick questionnaire to help us find your flavor!
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
};

// Quiz Question Component (No changes needed here)
const QuizQuestion = ({ question, currentStep, totalSteps, onNext, onPrev, isLast }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (selectedOption !== null) {
      onNext(selectedOption);
      setSelectedOption(null);
    }
  };

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
          
          <p className="text-center text-gray-600 text-sm mb-4">
            Help us find your Perfect Meal!
          </p>
          
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
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {question.title}
          </h2>
          <p className="text-gray-600 text-sm">
            {question.subtitle}
          </p>
        </div>
        
        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                selectedOption === index
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
            disabled={selectedOption === null}
            className={`flex-1 font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 ${
              selectedOption === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isLast ? 'FINISH' : 'NEXT'} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Results Component
const Results = ({ answers, onGoToApp }) => { 
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Your Perfect Meal Profile
          </h1>
          <p className="text-gray-600">
            Based on your responses, we've created your personalized meal recommendations!
          </p>
        </div>
        
        <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Your Preferences:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>{answer}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={onGoToApp}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-full transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

// Main logic component that uses the hooks
function QuestionnaireLogic() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const questions = [
    {
      title: "What's your Diet preference?",
      subtitle: "You might be suggested by agreeable for you",
      icon: "🍽️",
      options: [
        { icon: "🥗", label: "Vegetarian" },
        { icon: "🥩", label: "Non-Vegetarian" },
        { icon: "🌱", label: "Vegan" },
        { icon: "🐟", label: "Pescatarian" }
      ]
    },
    {
      title: "Any food allergies or intolerances?",
      subtitle: "We'll make sure to avoid these in your recommendations",
      icon: "⚠️",
      options: [
        { icon: "🌾", label: "Gluten" },
        { icon: "🥛", label: "Dairy" },
        { icon: "🥚", label: "Eggs" },
        { icon: "🐟", label: "Fish" },
        { icon: "❌", label: "None" }
      ]
    },
    {
      title: "What are your health goals?",
      subtitle: "Select all that applies to define your journey",
      icon: "🎯",
      options: [
        { icon: "⚖️", label: "Weight Loss" },
        { icon: "💪", label: "More Energy" },
        { icon: "🧘", label: "Muscle Gain" },
        { icon: "🥗", label: "Balanced Diet" },
        { icon: "🛡️", label: "Better Sleep" },
        { icon: "😌", label: "Stress Relief" }
      ]
    },
    {
      title: "How would you describe your lifestyle?",
      subtitle: "Help us to calibrate your activity to recommendations",
      icon: "🏃",
      options: [
        { icon: "🪑", label: "Sedentary (desk job, minimal exercise)" },
        { icon: "🚶", label: "Moderate (some walking, light exercise)" },
        { icon: "🏋️", label: "Active (regular workouts, sports)" },
        { icon: "⚡", label: "Very Active (intense daily exercise)" }
      ]
    }
  ];

  const handleStartQuestionnaire = () => {
    setCurrentPage('quiz');
  };

  const handleNext = (selectedOption) => {
    const answer = questions[currentQuestion].options[selectedOption].label;
    setAnswers([...answers, answer]);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Logic for saving data would go here (e.g., call API endpoint with 'answers')
      setCurrentPage('results');
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleGoToApp = () => {
    // Navigate to the main application page after quiz completion
    navigate('/Analyze'); 
  };

  if (currentPage === 'intro') {
    return <QuizIntro onNext={handleStartQuestionnaire} />;
  }

  if (currentPage === 'quiz') {
    return (
      <QuizQuestion
        question={questions[currentQuestion]}
        currentStep={currentQuestion}
        totalSteps={questions.length}
        onNext={handleNext}
        onPrev={handlePrev}
        isLast={currentQuestion === questions.length - 1}
      />
    );
  }

  if (currentPage === 'results') {
    return <Results answers={answers} onGoToApp={handleGoToApp} />;
  }

  return null;
}

// 🐛 Export the logic component directly as the default export
export default QuestionnaireLogic;