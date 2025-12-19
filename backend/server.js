import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import PantryRoutes from "./routes/Pantry.js";
import aiRoutes from "./routes/ai.js";
import ProgressRoutes from "./routes/progress.js";
import mealRoutes from "./routes/meals.js";
import calorieRoutes from "./routes/calorie.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Backend is running 🚀" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pantry", PantryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", ProgressRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/calorie", calorieRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10s timeout
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Check Atlas whitelist / network connection!");
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
