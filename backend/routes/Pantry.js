import express from "express";
import mongoose from "mongoose";

import Pantry from "../models/pantry.js";
import UserProfile from "../models/UserProfile.js";
import authMiddleware from "../middleware/authMiddleware.js";

import { generateRecipesFromIngredients } from "../utils/groqClient.js";
import { filterRecipesForAllergies } from "../utils/allergyFilter.js";

const router = express.Router();

router.use(authMiddleware);

const VALID_CATEGORIES = new Set(["kitchen", "fridge"]);
const MAX_ITEMS_PER_REQUEST = 50;
const MAX_ITEM_NAME_LENGTH = 100;
const MAX_QUANTITY_LENGTH = 100;

// Add pantry items
router.post("/add", async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, items } = req.body;

    if (!VALID_CATEGORIES.has(category)) {
      return res.status(400).json({
        error: "Invalid category. Must be 'kitchen' or 'fridge'.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "At least one pantry item is required.",
      });
    }

    if (items.length > MAX_ITEMS_PER_REQUEST) {
      return res.status(400).json({
        error: `You can add at most ${MAX_ITEMS_PER_REQUEST} items at once.`,
      });
    }

    const cleanedItems = [];

    for (const item of items) {
      const name = typeof item?.name === "string"
        ? item.name.trim()
        : "";

      const quantity = typeof item?.quantity === "string"
        ? item.quantity.trim()
        : "";

      if (!name || !quantity) {
        return res.status(400).json({
          error: "Every pantry item must have a name and quantity.",
        });
      }

      if (name.length > MAX_ITEM_NAME_LENGTH) {
        return res.status(400).json({
          error: `Item name must be ${MAX_ITEM_NAME_LENGTH} characters or less.`,
        });
      }

      if (quantity.length > MAX_QUANTITY_LENGTH) {
        return res.status(400).json({
          error: `Quantity must be ${MAX_QUANTITY_LENGTH} characters or less.`,
        });
      }

      cleanedItems.push({
        name,
        quantity,
      });
    }

    let pantry = await Pantry.findOne({ userId });

    if (!pantry) {
      pantry = new Pantry({
        userId,
        kitchen: [],
        fridge: [],
      });
    }

    pantry[category].push(...cleanedItems);

    await pantry.save();

    const addedItems = pantry[category].slice(-cleanedItems.length);

    return res.status(201).json({
      message: "Items added successfully.",
      items: addedItems,
    });
  } catch (error) {
    console.error("Add pantry error:", error);

    return res.status(500).json({
      error: "Unable to add pantry items.",
    });
  }
});

// Get authenticated user's pantry
router.get("/", async (req, res) => {
  try {
    const pantry = await Pantry.findOne({
      userId: req.user.id,
    }).lean();

    if (!pantry) {
      return res.json({
        pantry: {
          kitchen: [],
          fridge: [],
        },
      });
    }

    return res.json({
      pantry: {
        kitchen: Array.isArray(pantry.kitchen) ? pantry.kitchen : [],
        fridge: Array.isArray(pantry.fridge) ? pantry.fridge : [],
      },
    });
  } catch (error) {
    console.error("Get pantry error:", error);

    return res.status(500).json({
      error: "Unable to load pantry.",
    });
  }
});

// Delete a pantry item belonging to the authenticated user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid pantry item ID.",
      });
    }

    const pantry = await Pantry.findOne({
      userId,
      $or: [
        { "kitchen._id": id },
        { "fridge._id": id },
      ],
    });

    if (!pantry) {
      return res.status(404).json({
        error: "Pantry item not found.",
      });
    }

    let removed = false;

    for (const category of ["kitchen", "fridge"]) {
      const originalLength = pantry[category].length;

      pantry[category] = pantry[category].filter(
        (item) => item._id.toString() !== id
      );

      if (pantry[category].length !== originalLength) {
        removed = true;
      }
    }

    if (!removed) {
      return res.status(404).json({
        error: "Pantry item not found.",
      });
    }

    await pantry.save();

    return res.json({
      message: "Item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete pantry error:", error);

    return res.status(500).json({
      error: "Unable to delete pantry item.",
    });
  }
});

// Generate AI recipes from pantry
router.post("/suggest-recipes", async (req, res) => {
  try {
    const userId = req.user.id;

    const pantry = await Pantry.findOne({
      userId,
    }).lean();

    if (!pantry) {
      return res.status(400).json({
        error: "No pantry items available.",
      });
    }

    const getItemNames = (items) =>
      (Array.isArray(items) ? items : [])
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : typeof item?.name === "string"
              ? item.name.trim()
              : ""
        )
        .filter(Boolean);

    const kitchenItems = getItemNames(pantry.kitchen);
    const fridgeItems = getItemNames(pantry.fridge);

    const allItems = [...kitchenItems, ...fridgeItems];

    if (allItems.length === 0) {
      return res.status(400).json({
        error: "No pantry items available.",
      });
    }

    // Avoid sending an unnecessarily huge ingredient list to the AI.
    const uniqueItems = [...new Set(allItems)].slice(0, 100);

    const profile = await UserProfile.findOne({
      userId,
    }).lean();

    let recipes = await generateRecipesFromIngredients(
      uniqueItems,
      profile
    );

    if (!Array.isArray(recipes)) {
      recipes = [];
    }

    const allergies = Array.isArray(profile?.allergies)
      ? profile.allergies
      : [];

    if (allergies.length > 0 && recipes.length > 0) {
      const beforeCount = recipes.length;

      recipes = filterRecipesForAllergies(
        recipes,
        allergies
      );

      if (recipes.length < beforeCount) {
        console.log(
          `Filtered ${
            beforeCount - recipes.length
          } recipe(s) because of user allergies: ${allergies.join(", ")}`
        );
      }
    }

    return res.json({
      success: true,
      recipes,
      personalized: Boolean(
        profile &&
          (
            profile.dietaryPreferences ||
            allergies.length > 0 ||
            (Array.isArray(profile.healthGoals) &&
              profile.healthGoals.length > 0) ||
            profile.lifestyle
          )
      ),
    });
  } catch (error) {
    console.error("Suggest recipes error:", error);

    return res.status(500).json({
      error:
        "Failed to generate recipe suggestions. Please try again.",
    });
  }
});

export default router;