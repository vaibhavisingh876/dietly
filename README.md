# Dietly 🥗

### AI-Powered Meal Analyzer & Personalized Health Tracker

Dietly is a full-stack health and nutrition application that helps users understand their meals, track daily calorie intake, manage pantry ingredients, and receive AI-powered nutritional insights.

The application combines a React frontend with a Node.js/Express backend, MongoDB persistence, JWT authentication, and Groq-powered AI analysis.

---

## ✨ Features

### 🤖 AI Meal Analysis
- Analyze meals using natural-language descriptions.
- Get nutritional information including:
  - Calories
  - Protein
  - Carbohydrates
  - Fat
  - Fiber
- Receive personalized AI-generated feedback.
- Store analyzed meals in the user's history.

### 📊 Calorie & Progress Tracking
- Track daily calorie consumption.
- Maintain meal-wise calorie totals.
- Track progress and streaks.
- Timezone-aware daily tracking.

### 🥫 Smart Pantry
- Maintain separate kitchen and refrigerator inventories.
- Add ingredients with quantities.
- Delete pantry items.
- Generate AI-powered recipes using available ingredients.

### 🔐 Authentication
- User registration and login.
- JWT-based authentication.
- Protected API routes.
- User-specific meal, pantry and progress data.

### 🕒 Timezone-Aware Tracking
Dietly resolves the user's local timezone so daily meals, calorie records and progress are assigned to the correct calendar day instead of relying on UTC.

### 🛡️ Input & AI Validation
- Backend validation for user input.
- Validation of AI-generated nutritional results.
- Protected user-specific database operations.
- Allergy-aware AI processing.

---

## 🏗️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI
- Groq API
- LLM-based meal and recipe analysis

---