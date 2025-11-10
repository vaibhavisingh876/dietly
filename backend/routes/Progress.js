import express from "express";
import Progress from "../models/Progress.js";

const router = express.Router();

// ✅ Add progress record
router.post("/add", async (req, res) => {
  try {
    const { userId, date, caloriesConsumed, caloriesBurned, mealsTracked } = req.body;

    // Simple validation
    if (!userId || !date) {
      return res.status(400).json({ error: "userId and date are required" });
    }

    const progress = new Progress({
      userId,
      date,
      caloriesConsumed: caloriesConsumed || 0,
      caloriesBurned: caloriesBurned || 0,
      mealsTracked: mealsTracked || 0,
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
    const progress = await Progress.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .lean(); // faster, returns plain JS objects
    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
