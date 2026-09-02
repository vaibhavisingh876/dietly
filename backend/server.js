import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import PantryRoutes from "./routes/Pantry.js";
import ProgressRoutes from "./routes/Progress.js";
import mealRoutes from "./routes/meals.js";
import calorieRoutes from "./routes/calorie.js";

dotenv.config();

const app = express();

/* -------------------- CORS -------------------- */

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (for example server-to-server requests).
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* -------------------- Middleware -------------------- */

app.use(express.json({ limit: "1mb" }));

/* -------------------- Health Check -------------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dietly backend is running",
  });
});

/* -------------------- API Routes -------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/pantry", PantryRoutes);
app.use("/api/progress", ProgressRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/calorie", calorieRoutes);

/* -------------------- 404 Handler -------------------- */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* -------------------- Error Handler -------------------- */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* -------------------- Server -------------------- */

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Dietly backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();