// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'

// Pages
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import Pantry from './pages/Pantry'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  )
}

