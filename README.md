# Dietly 🥗

### AI-Powered Meal Analyzer & Personalized Health Tracker

Dietly is a full-stack AI-powered nutrition and health tracking application that helps users understand what they eat, track calories and hydration, manage pantry ingredients, and receive personalized nutritional insights.

The application combines a React frontend, Node.js/Express backend, MongoDB persistence, JWT authentication, and Groq-powered AI analysis.

---

## ✨ Features

### 🤖 AI Meal Analysis

- Describe a meal using natural language.
- Get estimated:
  - Calories
  - Protein
  - Carbohydrates
  - Fat
  - Fiber
- Receive personalized nutritional feedback.
- Automatically save analyzed meals to history.
- AI-generated values are clearly presented as estimates.

### 📊 Calorie Tracking

- Track calories for:
  - Breakfast
  - Lunch
  - Dinner
  - Evening Snack
- Set calories manually or use AI meal analysis.
- Track daily calorie goals.
- View remaining calories for the day.
- Track daily water intake.

### 📈 Progress & Streaks

- Track daily nutrition activity.
- Maintain meal logging streaks.
- View calorie trends.
- View water intake trends.
- Analyze macronutrient totals.
- Timezone-aware daily tracking.

### 🥫 Smart Pantry

- Maintain separate:
  - Refrigerator inventory
  - Kitchen inventory
- Add ingredients with quantities.
- Delete pantry items.
- Generate recipe suggestions using available ingredients.
- Apply allergy-aware filtering to generated recipes.

### 👤 Personalized Profile

Users can provide:

- Age
- Gender
- Height
- Weight
- Dietary preference
- Allergies
- Health goals
- Lifestyle/activity level

The profile is used to personalize calorie goals and AI-generated nutritional guidance.

### 🔐 Authentication

- User registration and login.
- JWT-based authentication.
- Protected API routes.
- Persistent or session-based login.
- User-specific meals, pantry data and progress.

### 🛡️ Validation & Safety

- Backend input validation.
- AI response validation.
- Request size limits.
- Protected user-owned database operations.
- Allergy conflict warnings.
- AI nutrition disclaimers.
- Timezone-aware date handling.

---

## 🏗️ Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
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
- LLM-powered meal analysis
- AI-powered recipe generation

---

## 📂 Project Structure

```text
dietly/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
Getting Started
Prerequisites

Make sure you have:

Node.js 18+
npm
MongoDB / MongoDB Atlas
Groq API key
1. Clone the repository
git clone https://github.com/vaibhavisingh876/dietly.git

cd dietly
2. Install frontend dependencies
cd frontend
npm install

Start the frontend:

npm run dev

The Vite development server will normally run on:

http://localhost:5173
3. Install backend dependencies

Open another terminal:

cd backend
npm install

Start the backend:

npm run dev

For production-style startup:

npm start

The backend defaults to:

http://localhost:5000
🔐 Environment Variables

Create:

backend/.env

Example:

NODE_ENV=development

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

GROQ_API_KEY=your_groq_api_key

GROQ_MODEL=openai/gpt-oss-20b

FRONTEND_URL=http://localhost:5173

For production, replace the local frontend URL with the deployed frontend URL.

Never commit .env or API keys to GitHub.

🌐 Frontend Environment

If the frontend is connected to a deployed backend, create:

frontend/.env

Example:

VITE_API_URL=https://your-backend-domain.com/api

If VITE_API_URL is not provided, the frontend falls back to:

http://localhost:5000/api
🧠 How Dietly Works
User
  │
  ▼
React Frontend
  │
  │ JWT + API request
  ▼
Express Backend
  │
  ├── Authentication
  ├── Profile
  ├── Meal Analysis
  ├── Calorie Tracking
  ├── Pantry
  └── Progress
  │
  ├──────────────► MongoDB
  │
  └──────────────► Groq AI
                       │
                       ▼
                Structured nutrition
                / recipe response
                       │
                       ▼
                Validation + filtering
                       │
                       ▼
                  React UI
🔌 Main API Areas
Authentication
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
Meals
POST   /api/meals/analyze
POST   /api/meals/add
GET    /api/meals/history
GET    /api/meals/:id
Calories
GET    /api/calorie/today
POST   /api/calorie/add-meal-text
POST   /api/calorie/set-meal-calories
POST   /api/calorie/set-water
Pantry
GET    /api/pantry
POST   /api/pantry/add
DELETE /api/pantry/:id
POST   /api/pantry/suggest-recipes
Progress
GET    /api/progress/streak
GET    /api/progress/dashboard
⚠️ AI Disclaimer

Dietly provides AI-generated nutritional estimates for informational purposes.

The calorie, macro and recipe information generated by the application should not be treated as medical advice, diagnosis, or a guarantee that a meal is safe for a particular allergy or medical condition.

Users with allergies or medical conditions should verify ingredients and nutritional information independently and consult qualified professionals when necessary.
🚀 Deployment
Frontend

The frontend is a Vite application and can be deployed to platforms such as Vercel.

Set:

VITE_API_URL=https://your-backend-domain.com/api
Backend

The Express backend can be deployed to platforms such as Render or another Node.js-compatible hosting provider.

Required environment variables:

NODE_ENV
PORT
MONGO_URI
JWT_SECRET
GROQ_API_KEY
GROQ_MODEL
FRONTEND_URL
📌 Project Highlights
Full-stack React + Node.js application
AI-powered natural-language meal analysis
Personalized nutrition guidance
JWT authentication
MongoDB persistence
Timezone-aware calorie tracking
Pantry-based recipe generation
Allergy-aware filtering
Input and AI-response validation
Responsive UI with charts and dashboards
👩‍💻 Author

Vaibhavi Singh

B.Tech — Computer Science Engineering (AI)

GitHub:
https://github.com/vaibhavisingh876

📄 License

This project is currently intended as a personal/academic portfolio project.


---

### 2. `.gitignore`

```gitignore id="n3x6pt"
# =====================================================
# Dependencies
# =====================================================

node_modules/
**/node_modules/


# =====================================================
# Environment variables / secrets
# =====================================================

.env
.env.*
!.env.example

*.local


# =====================================================
# Production / build output
# =====================================================

dist/
dist-ssr/
build/
coverage/


# =====================================================
# Logs
# =====================================================

logs/
*.log

npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*


# =====================================================
# Editor / IDE
# =====================================================

.vscode/*
!.vscode/extensions.json

.idea/

*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?


# =====================================================
# OS files
# =====================================================

.DS_Store
Thumbs.db


# =====================================================
# Temporary files
# =====================================================

*.tmp
*.temp
*.bak
*.swp