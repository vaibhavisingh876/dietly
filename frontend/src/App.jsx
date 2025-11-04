// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'

// Pages
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Pantry from './pages/Pantry'
import Login from './pages/Login'
import Register from './pages/Register'
import Questionnaire from './pages/Questionnaire';



export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="w-full">

     <Routes>
  <Route path="/Home" element={<Home/>} />
  <Route path="/Home" element={<Home />} />
  <Route path="/analyze" element={<Analyze />} />
  <Route path="/pantry" element={<Pantry />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/questionnaire" element={<Questionnaire />} />
  </Routes>

      </div>
    </div>
  )
}

