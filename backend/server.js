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

app.disable("x-powered-by");

/* -------------------- CORS -------------------- */

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean)
  : ["http://localhost:5173"];

console.log("Allowed CORS origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    // (Postman, server-to-server requests, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("Blocked CORS origin:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

/* -------------------- Middleware -------------------- */

app.use(
  express.json({
    limit: "1mb",
  })
);

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

/* -------------------- API 404 -------------------- */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* -------------------- Global Error Handler -------------------- */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    err.body
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* -------------------- Server -------------------- */

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Dietly backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error.message
    );

    process.exit(1);
  }
}

start();