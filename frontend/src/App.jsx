// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Analyze from "./pages/Analyze.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import PantryPage from "./pages/Pantry.jsx";
import Calories from "./pages/Calories.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/pantry" element={<PantryPage />} />
      <Route path="/calories" element={<Calories />} />
    </Routes>
  );
}
