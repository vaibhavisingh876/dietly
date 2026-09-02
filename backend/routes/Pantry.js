import express from "express";

import Pantry from "../models/pantry.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateRecipesFromIngredients } from "../utils/groqClient.js";

const router = express.Router();

router.use(authMiddleware);

/* -------------------- Validation -------------------- */

const VALID_CATEGORIES = ["kitchen", "fridge"];

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      message: "Items must be a non-empty array.",
    };
  }

  if (items.length > 50) {
    return {
      valid: false,
      message: "You can add at most 50 items at a time.",
    };
  }

  for (const item of items) {
    if (!item || typeof item !== "object") {
      return {
        valid: false,
        message: "Each pantry item must be an object.",
      };
    }

    if (
      typeof item.name !== "string" ||
      !item.name.trim()
    ) {
      return {
        valid: false,
        message: "Each item requires a name.",
      };
    }

    if (
      typeof item.quantity !== "string" ||
      !item.quantity.trim()
    ) {
      return {
        valid: false,
        message: "Each item requires a quantity.",
      };
    }

    if (item.name.trim().length > 100) {
      return {
        valid: false,
        message: "Item name is too long.",
      };
    }

    if (item.quantity.trim().length > 100) {
      return {
        valid: false,
        message: "Item quantity is too long.",
      };
    }
  }

  return { valid: true };
}

/* -------------------- Add Items -------------------- */

router.post("/add", async (req, res) => {
  try {
    const { category, items } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Category must be 'kitchen' or 'fridge'.",
      });
    }

    const validation = validateItems(items);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message,
      });
    }

    const userId = req.user.id;

    let pantry = await Pantry.findOne({ userId });

    if (!pantry) {
      pantry = new Pantry({
        userId,
        kitchen: [],
        fridge: [],
      });
    }

    const cleanedItems = items.map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity.trim(),
    }));

    pantry[category].push(...cleanedItems);

    await pantry.save();

    const addedItems = pantry[category].slice(-cleanedItems.length);

    return res.status(201).json({
      success: true,
      message: "Items added successfully.",
      items: addedItems,
    });
  } catch (error) {
    console.error("Add pantry error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to add pantry items.",
    });
  }
});

/* -------------------- Get Pantry -------------------- */

router.get("/", async (req, res) => {
  try {
    const pantry = await Pantry.findOne({
      userId: req.user.id,
    }).lean();

    if (!pantry) {
      return res.json({
        success: true,
        pantry: {
          kitchen: [],
          fridge: [],
        },
      });
    }

    return res.json({
      success: true,
      pantry,
    });
  } catch (error) {
    console.error("Get pantry error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load pantry.",
    });
  }
});

/* -------------------- Delete Item -------------------- */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pantry = await Pantry.findOne({
      userId: req.user.id,
      $or: [
        { "kitchen._id": id },
        { "fridge._id": id },
      ],
    });

    if (!pantry) {
      return res.status(404).json({
        success: false,
        error: "Pantry item not found.",
      });
    }

    let deleted = false;

    for (const category of VALID_CATEGORIES) {
      const originalLength = pantry[category].length;

      pantry[category] = pantry[category].filter(
        (item) => item._id.toString() !== id
      );

      if (pantry[category].length !== originalLength) {
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Pantry item not found.",
      });
    }

    await pantry.save();

    return res.json({
      success: true,
      message: "Pantry item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete pantry error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to delete pantry item.",
    });
  }
});

/* -------------------- AI Recipe Suggestions -------------------- */

router.post("/suggest-recipes", async (req, res) => {
  try {
    const pantry = await Pantry.findOne({
      userId: req.user.id,
    }).lean();

    if (!pantry) {
      return res.status(400).json({
        success: false,
        error: "No pantry items available.",
      });
    }

    const getItemNames = (items = []) =>
      items
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name
        )
        .filter(
          (name) =>
            typeof name === "string" &&
            name.trim()
        )
        .map((name) => name.trim());

    const kitchenItems = getItemNames(pantry.kitchen);
    const fridgeItems = getItemNames(pantry.fridge);

    const allItems = [
      ...new Set([
        ...kitchenItems,
        ...fridgeItems,
      ]),
    ];

    if (allItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No pantry ingredients available.",
      });
    }

    const recipes = await generateRecipesFromIngredients(
      allItems.slice(0, 50)
    );

    return res.json({
      success: true,
      recipes: Array.isArray(recipes) ? recipes : [],
    });
  } catch (error) {
    console.error("Suggest recipes error:", error);

    return res.status(503).json({
      success: false,
      error:
        "Recipe suggestion service is temporarily unavailable.",
    });
  }
});

export default router;