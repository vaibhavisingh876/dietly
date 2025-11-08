// server.js

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


app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/pantry", PantryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/Progress", ProgressRoutes);
app.use("/api/meals", mealRoutes);


mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
