import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import PantryRoutes from "./routes/Pantry.js";
import aiRoutes from "./routes/ai.js";
import ProgressRoutes from "./routes/Progress.js";
import mealRoutes from "./routes/meals.js";
import calorieRoutes from "./routes/calorie.js";

dotenv.config();
const app = express();

// --- CORS ---
// FRONTEND_URL can be a comma-separated list of allowed origins for
// production. If unset (local dev), allow all origins so `npm run dev`
// keeps working without extra setup.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : null;

app.use(
  cors(
    allowedOrigins
      ? {
          origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          },
        }
      : {}
  )
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Backend is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pantry", PantryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", ProgressRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/calorie", calorieRoutes);

// 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();