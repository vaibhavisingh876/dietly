// routes/progress.js

import express from "express";
import Progress from "../models/Progress.js";

const router = express.Router();

// ✅ Add progress record (e.g., calories burned, meals tracked)
router.post("/add", async (req, res) => {
  try {
    const { userId, date, caloriesConsumed, caloriesBurned, mealsTracked } = req.body;

    const progress = new Progress({
      userId,
      date,
      caloriesConsumed,
      caloriesBurned,
      mealsTracked,
    });

    await progress.save();
    res.status(201).json({ message: "Progress added successfully", progress });
  } catch (error) {
    console.error("Error adding progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all progress records of a user
router.get("/user/:userId", async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.params.userId }).sort({ date: -1 });
    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
