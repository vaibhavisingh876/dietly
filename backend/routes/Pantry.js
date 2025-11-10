import express from "express";
import Pantry from "../models/Pantry.js";

const router = express.Router();

// Add new pantry items
router.post("/add", async (req, res) => {
  try {
    const { userId, category, items } = req.body;
    if (!userId || !category || !items) 
      return res.status(400).json({ error: "Missing fields" });

    let pantry = await Pantry.findOne({ userId });
    if (!pantry) pantry = new Pantry({ userId, kitchen: [], fridge: [] });

    pantry[category] = pantry[category].concat(items);
    await pantry.save();

    // Return only newly added items
    res.status(201).json({ message: "Items added", items: pantry[category].slice(-items.length) });
  } catch (err) {
    console.error("Add pantry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get pantry items for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ userId: req.params.userId });
    if (!pantry) return res.json({ pantry: { kitchen: [], fridge: [] } });
    res.json({ pantry });
  } catch (err) {
    console.error("Get pantry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific pantry item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pantry = await Pantry.findOne({ "kitchen._id": id }) || await Pantry.findOne({ "fridge._id": id });
    if (!pantry) return res.status(404).json({ error: "Item not found" });

    ['kitchen', 'fridge'].forEach(cat => {
      pantry[cat] = pantry[cat].filter(item => item._id.toString() !== id);
    });

    await pantry.save();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete pantry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
