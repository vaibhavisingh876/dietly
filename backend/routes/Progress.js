import express from "express";
import Progress from "../models/progress.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// ✅ Add progress record
router.post("/add", async (req, res) => {
  try {
    const {
      date,
      caloriesConsumed,
      caloriesBurned,
      protein,
      carbs,
      fats,
      mealsTracked
    } = req.body;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }

    const progress = new Progress({
      userId,
      date,
      caloriesConsumed: caloriesConsumed || 0,
      caloriesBurned: caloriesBurned || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      mealsTracked: mealsTracked || 0,
    });

    await progress.save();
    res.status(201).json({ message: "Progress added successfully", progress });
  } catch (error) {
    console.error("Error adding progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all progress records of the authenticated user
router.get("/", async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean();
    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;