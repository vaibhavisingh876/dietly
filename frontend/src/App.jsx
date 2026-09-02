
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Nav from "./components/Nav.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Analyze from "./pages/Analyze.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import Pantry from "./pages/Pantry.jsx";
import Calories from "./pages/Calories.jsx";
import MealAnalysisPage from "./pages/MealAnalysisPage.jsx";
import Progress from "./pages/Progress.jsx";

function AppLayout() {
  const location = useLocation();

  const hideNavbar = ["/login", "/register", "/questionnaire"].includes(
    location.pathname
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNavbar && <Nav />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/questionnaire" element={<Questionnaire />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/analyze" element={<Analyze />} />

        <Route path="/history" element={<MealAnalysisPage />} />

        <Route path="/history/:id" element={<MealAnalysisPage />} />

        <Route path="/pantry" element={<Pantry />} />

        <Route path="/calories" element={<Calories />} />

        <Route path="/progress" element={<Progress />} />

        <Route
          path="*"
          element={
            <div className="min-h-[70vh] flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-slate-900">
                  404
                </h1>

                <p className="mt-3 text-slate-600">
                  The page you're looking for doesn't exist.
                </p>

                <a
                  href="/"
                  className="inline-block mt-6 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}

