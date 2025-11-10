import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import PantryRoutes from "./routes/Pantry.js";
import aiRoutes from "./routes/ai.js";
import ProgressRoutes from "./routes/progress.js";
import mealRoutes from "./routes/meals.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Backend is running successfully 🚀" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pantry", PantryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", ProgressRoutes);
app.use("/api/meals", mealRoutes);

// Connect to MongoDB with proper options for SRV / DNS / hotspot issues
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000 // 10 seconds timeout
  })
  .then(() => console.log("MongoDB connected successfully 🚀"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Check Atlas IP whitelist and network connection!");
    process.exit(1); // Stop server if DB connection fails
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
