// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Pantry from './pages/Pantry'
import Login from './pages/Login'
import Register from './pages/Register'
import Questionnaire from './pages/Questionnaire'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/pantry" element={<Pantry />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
    </Routes>
  )
}
