import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import ModernNavbar from "./components/Nav.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Analyze from "./pages/Analyze.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import PantryPage from "./pages/Pantry.jsx";
import Calories from "./pages/Calories.jsx";
import MealAnalysisPage from "./pages/MealAnalysisPage.jsx";

function AppLayout() {
  const location = useLocation();

  const hideNavbar = [
    "/login",
    "/register",
    "/questionnaire",
  ].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <ModernNavbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/questionnaire" element={<Questionnaire />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/analyze" element={<Analyze />} />

        <Route path="/pantry" element={<PantryPage />} />

        <Route path="/calories" element={<Calories />} />

        <Route path="/history" element={<MealAnalysisPage />} />
        <Route path="/history/:id" element={<MealAnalysisPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppLayout />;
}