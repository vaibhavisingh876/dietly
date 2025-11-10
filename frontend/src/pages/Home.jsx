// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import {
  Leaf,
  Apple,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Heart,
  Calendar,
  Globe,
  LucideLoader2,
} from "lucide-react";
import Nav from "../components/Nav.jsx";

export default function Home() {
  // Counter animation hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(interval);
        }
        setCount(Math.floor(start));
      }, 16);
      return () => clearInterval(interval);
    }, [end, duration]);
    return count;
  };

  const usersCount = useCounter(50000);
  const mealsCount = useCounter(1000000);
  const ratingCount = 4.8;
  const countryCount = useCounter(100);

  const features = [
    {
      icon: <Apple className="w-8 h-8" />,
      title: "Smart Meal Analysis",
      description:
        "Get instant nutritional and health insights for every meal you log powered by AI.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Personalized Feedback",
      description:
        "Receive meaningful suggestions to improve your eating habits and balance your diet.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Daily Streak Tracking",
      description:
        "Stay motivated with streaks that reward consistency in logging meals and healthy choices.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Macro Tracking",
      description:
        "Monitor your protein, carbs, and fats intake to ensure balanced nutrition every day.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Meal History & Progress",
      description:
        "Easily view your past meals and monitor how your eating habits evolve over time.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "AI-Driven Health Insights",
      description:
        "Go beyond calorie counts and understand the true nutritional impact of your food.",
    },
  ];

  const team = [
    { name: "Nitya Singh", image: "NS" },
    { name: "Shreya Bisht", image: "SB" },
    { name: "Shreya Rathore", image: "SR" },
    { name: "Vaibhavi Singh", image: "VS" },
  ];

  return (
    <div className="w-screen min-h-screen bg-white">
      <Nav currentPage="Home" />

      {/* Welcome Section */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-br from-green-50 via-green-100 to-green-200 px-6">
        <Leaf className="w-20 h-20 text-green-600 mb-4 animate-bounce" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-green-600">Dietly</span>
        </h1>
        <p className="text-2xl text-gray-700 font-medium mb-6">
          Feed Your Ambition, Not Just Your Appetite.
        </p>
        <p className="max-w-2xl text-gray-600 mb-8 leading-relaxed">
          Your personal meal companion designed to make healthy eating effortless and smart.
          Track, analyze, and transform your eating habits with AI-powered insights.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => document.getElementById("about").scrollIntoView({ behavior: "smooth" })}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
          >
            Get Started
          </button>
          <button className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* About + Impact Section */}
      <section id="about" className="py-24 bg-gray-50 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: About */}
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 text-center md:text-left">
              About Our App
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dietly is your personal meal companion designed to make healthy eating effortless and smart. It helps you understand what’s really on your plate by analyzing your meals and giving you clear, AI-powered insights into their nutritional value and overall health impact.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dietly encourages you to stay consistent with your eating goals through daily streaks that celebrate your progress and keep you motivated. Each time you log your meals, you not only track your food you track your journey toward better habits.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you’re focused on fitness, wellness, or simply mindful eating, Dietly makes it easier to stay informed, balanced, and consistent. It is more than just a tracker; it is your guide to building a healthier relationship with food.
            </p>
          </div>

          {/* Right: Impact (Animated Counters) */}
          <div className="bg-white rounded-2xl shadow-lg p-10 grid grid-cols-2 gap-8 text-center hover:scale-[1.02] transition-transform duration-300">
            <div className="hover:shadow-md p-4 rounded-lg transition">
              <Users className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-green-600">{usersCount.toLocaleString()}+</div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="hover:shadow-md p-4 rounded-lg transition">
              <LucideLoader2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-green-500">{(mealsCount / 1000000).toFixed(1)}M+</div>
              <p className="text-gray-600">Meals Tracked</p>
            </div>
            <div className="hover:shadow-md p-4 rounded-lg transition">
              <Heart className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-emerald-500">{ratingCount}★</div>
              <p className="text-gray-600">User Rating</p>
            </div>
            <div className="hover:shadow-md p-4 rounded-lg transition">
              <Globe className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-green-500">{countryCount}+</div>
              <p className="text-gray-600">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-green-100 text-green-600 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {team.map((m, i) => (
              <div key={i} className="text-center">
                <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white text-4xl font-bold shadow-md mb-4">
                  {m.image}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{m.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-7 h-7 text-green-500" />
              <span className="text-2xl font-bold text-white">Dietly</span>
            </div>
            <p className="text-gray-400 text-sm">Feed Your Ambition, Not Just Your Appetite.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <li>Features</li>
              <li>Pricing</li>
              <li>Download</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          © 2025 Dietly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
