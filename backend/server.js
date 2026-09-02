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

/* =====================================================
   BASIC APP CONFIG
===================================================== */

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* =====================================================
   CORS
===================================================== */

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests and local development.
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin not allowed by CORS")
      );
    },

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
      "X-Timezone",
    ],
  })
);

/* =====================================================
   BODY PARSING
===================================================== */

app.use(
  express.json({
    limit: "100kb",
  })
);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Dietly backend is running",
  });
});

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/pantry", PantryRoutes);
app.use("/api/progress", ProgressRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/calorie", calorieRoutes);

/* =====================================================
   UNKNOWN API ROUTE
===================================================== */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // CORS errors
  if (
    err.message === "Origin not allowed by CORS"
  ) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  // Malformed JSON
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload.",
    });
  }

  // Request body too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error."
        : err.message || "Internal server error.",
  });
});

/* =====================================================
   START SERVER
===================================================== */

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Dietly backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start backend:",
      error.message
    );

    process.exit(1);
  }
}

start();