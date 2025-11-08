// routes/meals.js

import express from "express";
import Meal from "../models/Meal.js";

const router = express.Router();

// ✅ Add a new meal
router.post("/add", async (req, res) => {
  try {
    const { userId, name, ingredients, recipe, calories, mealType, aiGenerated } = req.body;

    const meal = new Meal({
      userId,
      name,
      ingredients,
      recipe,
      calories,
      mealType,
      aiGenerated,
    });

    await meal.save();
    res.status(201).json({ message: "Meal added successfully", meal });
  } catch (error) {
    console.error("Error adding meal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all meals of a user
router.get("/user/:userId", async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Delete a meal
router.delete("/:id", async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
