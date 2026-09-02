import express from "express";
import Pantry from "../models/pantry.js";
import UserProfile from "../models/UserProfile.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateRecipesFromIngredients } from "../utils/groqClient.js";
import { filterRecipesForAllergies } from "../utils/allergyFilter.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Add new pantry items
router.post("/add", async (req, res) => {
  try {
    const { category, items } = req.body;
    const userId = req.user.id;

    if (!category || !items) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Validate category
    if (category !== "kitchen" && category !== "fridge") {
      return res.status(400).json({ error: "Invalid category. Must be 'kitchen' or 'fridge'." });
    }

    let pantry = await Pantry.findOne({ userId });
    if (!pantry) pantry = new Pantry({ userId, kitchen: [], fridge: [] });

    pantry[category] = pantry[category].concat(items);
    await pantry.save();

    // Return only newly added items
    res.status(201).json({
      message: "Items added",
      items: pantry[category].slice(-items.length)
    });
  } catch (err) {
    console.error("Add pantry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get pantry items for the authenticated user
router.get("/", async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ userId: req.user.id });
    if (!pantry) return res.json({ pantry: { kitchen: [], fridge: [] } });
    res.json({ pantry });
  } catch (err) {
    console.error("Get pantry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific pantry item (must belong to the authenticated user)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find pantry that belongs to the user and contains this item
    const pantry = await Pantry.findOne({
      userId,
      $or: [
        { "kitchen._id": id },
        { "fridge._id": id }
      ]
    });

    if (!pantry) return res.status(404).json({ error: "Item not found" });

    // Remove the item from both categories (it will be in one)
    ["kitchen", "fridge"].forEach(cat => {
      pantry[cat] = pantry[cat].filter(item => item._id.toString() !== id);
    });

    await pantry.save();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete pantry error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Suggest recipes based on pantry items + the user's dietary profile,
// using Groq. AI is asked to avoid the user's allergens, but that's never
// trusted alone — filterRecipesForAllergies() below is a deterministic
// backend safety layer that drops any recipe still containing a known
// allergen keyword. This is not medical advice; it's a best-effort filter.
router.post("/suggest-recipes", async (req, res) => {
  try {
    const userId = req.user.id;

    const pantry = await Pantry.findOne({ userId });
    if (!pantry) {
      return res.status(400).json({ error: "No pantry items available" });
    }

    // Collect ingredient names from both kitchen and fridge
    const getItemNames = (items) =>
      items.map(item => (typeof item === "string" ? item : item.name)).filter(Boolean);

    const kitchenItems = getItemNames(pantry.kitchen || []);
    const fridgeItems = getItemNames(pantry.fridge || []);
    const allItems = [...kitchenItems, ...fridgeItems];

    if (allItems.length === 0) {
      return res.status(400).json({ error: "No pantry items available" });
    }

    const profile = await UserProfile.findOne({ userId }).lean();

    // Call Groq to generate recipes, personalized to diet/allergies/goals/lifestyle
    let recipes = await generateRecipesFromIngredients(allItems, profile);

    // Deterministic safety layer on top of the AI's own allergen avoidance
    const allergies = profile?.allergies || [];
    if (allergies.length > 0) {
      const beforeCount = recipes.length;
      recipes = filterRecipesForAllergies(recipes, allergies);
      if (recipes.length < beforeCount) {
        console.log(
          `Filtered ${beforeCount - recipes.length} recipe(s) that conflicted with user allergies: ${allergies.join(", ")}`
        );
      }
    }

    res.json({
      success: true,
      recipes,
      personalized: Boolean(
        profile && (profile.dietaryPreferences || allergies.length || (profile.healthGoals || []).length || profile.lifestyle)
      ),
    });
  } catch (err) {
    console.error("Suggest recipes error:", err);
    // If Groq fails, return 500
    res.status(500).json({ error: "Failed to generate recipe suggestions" });
  }
});

export default router;