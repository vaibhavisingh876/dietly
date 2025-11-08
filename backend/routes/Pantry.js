// routes/Pantry.js

import express from "express";
import Pantry from "../models/Pantry.js";

const router = express.Router();

// ✅ Add item(s) to pantry
router.post("/add", async (req, res) => {
  try {
    const { userId, category, items } = req.body;

    const pantry = new Pantry({ userId, category, items });
    await pantry.save();

    res.status(201).json({ message: "Items added to pantry", pantry });
  } catch (error) {
    console.error("Error adding pantry items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all pantry items for a user
router.get("/test", (req, res) => {
  res.send("✅ Pantry route is connected!");
});

router.get("/user/:userId", async (req, res) => {
  try {
    const pantry = await Pantry.find({ userId: req.params.userId });
    res.status(200).json(pantry);
  } catch (error) {
    console.error("Error fetching pantry items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Delete specific pantry item
router.delete("/:id", async (req, res) => {
  try {
    await Pantry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pantry item deleted" });
  } catch (error) {
    console.error("Error deleting pantry item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
