import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  X,
  Trash2,
  ChefHat,
  Refrigerator,
  Utensils,
  Sparkles,
  Search,
} from "lucide-react";
import api from "../api/api";

const EMPTY_ITEM = {
  name: "",
  category: "kitchen",
  quantity: "",
};

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);

  const [showAddForm, setShowAddForm] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/pantry/");

      const pantryData = response.data?.pantry || {
        kitchen: [],
        fridge: [],
      };

      const allItems = [
        ...(Array.isArray(pantryData.kitchen)
          ? pantryData.kitchen.map((item) => ({
            ...item,
            category: "kitchen",
          }))
          : []),

        ...(Array.isArray(pantryData.fridge)
          ? pantryData.fridge.map((item) => ({
            ...item,
            category: "fridge",
          }))
          : []),
      ];

      setItems(allItems);
    } catch (error) {
      console.error("Error loading pantry:", error);

      setError(
        error.response?.data?.error ||
        "Unable to load your pantry. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async () => {
    clearMessages();

    const name = newItem.name.trim();
    const quantity = newItem.quantity.trim();

    if (!name) {
      setError("Please enter an item name.");
      return;
    }

    if (!quantity) {
      setError("Please enter the quantity.");
      return;
    }

    if (name.length > 100) {
      setError("Item name must be 100 characters or less.");
      return;
    }

    if (quantity.length > 100) {
      setError("Quantity must be 100 characters or less.");
      return;
    }

    try {
      setIsAdding(true);

      const response = await api.post("/pantry/add", {
        category: newItem.category,
        items: [
          {
            name,
            quantity,
          },
        ],
      });

      const backendItem = response.data?.items?.[0];

      if (backendItem) {
        setItems((prev) => [
          ...prev,
          {
            ...backendItem,
            category: newItem.category,
          },
        ]);
      } else {
        await loadItems();
      }

      setNewItem(EMPTY_ITEM);
      setShowAddForm(false);
      setSuccessMessage(`${name} added to your pantry.`);
    } catch (error) {
      console.error("Error adding pantry item:", error);

      setError(
        error.response?.data?.error ||
        "Unable to add the item. Please try again."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const deleteItem = async (id) => {
    if (!id) return;

    clearMessages();

    try {
      setDeletingId(id);

      await api.delete(`/pantry/${id}`);

      setItems((prev) => prev.filter((item) => item._id !== id));
      setSuccessMessage("Item removed from your pantry.");
    } catch (error) {
      console.error("Error deleting item:", error);

      setError(
        error.response?.data?.error ||
        "Unable to remove the item. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const generateMealSuggestions = async () => {
    if (items.length === 0) {
      setError("Add at least one pantry item before generating recipes.");
      return;
    }

    clearMessages();

    try {
      setIsGenerating(true);
      setSuggestedMeals([]);

      const response = await api.post("/pantry/suggest-recipes");

      const data = response.data;

      if (data.success && Array.isArray(data.recipes)) {
        setSuggestedMeals(data.recipes);

        if (data.recipes.length === 0) {
          setError(
            "No safe recipe suggestions were found for your current pantry and dietary restrictions."
          );
        }
      } else {
        throw new Error(
          data.error || "No recipe suggestions were returned."
        );
      }
    } catch (error) {
      console.error("Error generating AI meals:", error);

      setSuggestedMeals([]);

      setError(
        error.response?.data?.error ||
        error.message ||
        "Unable to generate meal suggestions. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) =>
      String(item.name || "").toLowerCase().includes(query)
    );
  }, [items, searchTerm]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        if (item.category === "fridge") {
          acc.fridge.push(item);
        } else {
          acc.kitchen.push(item);
        }

        return acc;
      },
      {
        kitchen: [],
        fridge: [],
      }
    );
  }, [filteredItems]);

  const renderItemList = (category, emptyIcon) => {
    const categoryItems = groupedItems[category] || [];

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-ink-400">Loading items...</p>
        </div>
      );
    }

    if (categoryItems.length === 0) {
      return (
        <div className="text-center py-12">
          {emptyIcon}
          <p className="text-ink-400">
            {searchTerm ? "No matching items" : "No items yet"}
          </p>
        </div>
      );
    }

    return categoryItems.map((item) => (
      <div
        key={item._id}
        className="flex items-center justify-between p-4 rounded-xl bg-cream-50 border-2 border-forest-100 hover:border-forest-300 transition-all shadow-sm hover:shadow-md"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-800 text-lg break-words">
            {item.name}
          </p>

          <p className="text-sm text-ink-500 break-words">
            {item.quantity}
          </p>
        </div>

        <button
          type="button"
          onClick={() => deleteItem(item._id)}
          disabled={deletingId === item._id}
          aria-label={`Remove ${item.name}`}
          className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingId === item._id ? (
            <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    ));
  };

  return (
    <div className="min-h-screen dietly-page-bg pt-28">
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-cream-50 px-8 py-4 rounded-2xl shadow-lg">
            <ChefHat className="w-12 h-12 text-forest-600" />

            <h1 className="font-display text-5xl font-semibold text-forest-700">
              Smart Pantry
            </h1>
          </div>

          <p className="text-lg text-ink-600 max-w-2xl mx-auto">
            Track your ingredients and discover AI-generated meals you can
            cook right now.
          </p>
        </div>

        {/* Global messages */}
        {(error || successMessage) && (
          <div className="max-w-3xl mx-auto mb-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
                <p className="text-sm">{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-600"
                  aria-label="Dismiss error"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {!error && successMessage && (
              <div className="bg-forest-50 border border-forest-200 text-forest-700 rounded-xl px-5 py-4">
                <p className="text-sm">{successMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Stats & Actions */}
        <div className="bg-cream-50 rounded-2xl shadow-sm p-6 mb-8 border border-forest-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-600">
                  {items.length}
                </p>
                <p className="text-sm text-ink-600">Total Items</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-forest-600">
                  {groupedItems.kitchen.length}
                </p>
                <p className="text-sm text-ink-600">Kitchen</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-teal-600">
                  {groupedItems.fridge.length}
                </p>
                <p className="text-sm text-ink-600">Fridge</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setShowAddForm((prev) => !prev);
                }}
                className="flex items-center gap-2 bg-forest-600 text-white px-6 py-3 rounded-lg hover:bg-forest-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>

              <button
                type="button"
                onClick={generateMealSuggestions}
                disabled={items.length === 0 || isGenerating || isLoading}
                className="flex items-center gap-2 bg-clay-500 text-white px-6 py-3 rounded-lg hover:bg-clay-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? "Generating..." : "Suggest Meals"}
              </button>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-cream-50 rounded-2xl shadow-md p-8 mb-8 border-2 border-forest-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-semibold text-ink-800">
                Add New Item
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  clearMessages();
                }}
                className="text-ink-400 hover:text-ink-600"
                aria-label="Close add item form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                maxLength={100}
                placeholder="Item name (e.g., Eggs)"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="border-2 border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:border-forest-500 transition-colors"
              />

              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="border-2 border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:border-forest-500 transition-colors bg-cream-50"
              >
                <option value="kitchen">🍳 Kitchen</option>
                <option value="fridge">❄️ Refrigerator</option>
              </select>

              <input
                type="text"
                maxLength={100}
                placeholder="Quantity (e.g., 12 pieces)"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                className="border-2 border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:border-forest-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={isAdding}
              className="w-full bg-forest-600 text-white px-6 py-4 rounded-lg hover:bg-forest-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? "Adding..." : "Add to Pantry"}
            </button>
          </div>
        )}

        {/* Search */}
        {items.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-400 w-5 h-5" />

              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-cream-300 rounded-xl focus:outline-none focus:border-forest-500 transition-colors bg-cream-50 shadow-md"
              />
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {Array.isArray(suggestedMeals) &&
          suggestedMeals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-3xl font-semibold text-ink-800 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                  AI-Generated Meals & Recipes
                </h2>

                <button
                  type="button"
                  onClick={() => setSuggestedMeals([])}
                  className="text-sm text-ink-500 hover:text-ink-700"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedMeals.map((meal, idx) => (
                  <div
                    key={`${meal.name || "meal"}-${idx}`}
                    className="bg-cream-50 rounded-2xl shadow-sm p-6 border-2 border-amber-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h3 className="font-display text-xl font-semibold text-ink-800">
                        {meal.name || "Unnamed Meal"}
                      </h3>

                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                        {meal.difficulty || "N/A"}
                      </span>
                    </div>

                    <p className="text-sm text-amber-600 mb-3">
                      🕐 {meal.cookTime || "N/A"}
                    </p>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-ink-700">
                        Ingredients:
                      </p>

                      <div className="space-y-1">
                        {Array.isArray(meal.ingredients) &&
                          meal.ingredients.length > 0 ? (
                          meal.ingredients.map((ingredient, i) => (
                            <p
                              key={i}
                              className="text-sm text-ink-600 bg-cream-50 px-3 py-1 rounded-lg"
                            >
                              ✓ {ingredient}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-ink-400">
                            No ingredients listed
                          </p>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-ink-700 mt-3">
                        Recipe:
                      </p>

                      <p className="text-sm text-ink-600 whitespace-pre-line">
                        {meal.recipe || "No recipe available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Pantry Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Kitchen */}
          <div className="bg-cream-50 rounded-2xl shadow-sm p-8 border-2 border-forest-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-forest-100 p-3 rounded-xl">
                <Utensils className="w-7 h-7 text-forest-600" />
              </div>

              <div className="flex-1">
                <h2 className="font-display text-2xl font-semibold text-ink-800">
                  Kitchen
                </h2>
                <p className="text-sm text-ink-500">
                  Pantry essentials
                </p>
              </div>

              <span className="bg-forest-100 text-forest-700 px-4 py-2 rounded-full text-lg font-bold">
                {groupedItems.kitchen.length}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {renderItemList(
                "kitchen",
                <Utensils className="w-16 h-16 text-ink-400 mx-auto mb-3" />
              )}
            </div>
          </div>

          {/* Refrigerator */}
          <div className="bg-cream-50 rounded-2xl shadow-sm p-8 border-2 border-cream-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cream-200 p-3 rounded-xl">
                <Refrigerator className="w-7 h-7 text-teal-600" />
              </div>

              <div className="flex-1">
                <h2 className="font-display text-2xl font-semibold text-ink-800">
                  Refrigerator
                </h2>

                <p className="text-sm text-ink-500">
                  Fresh & cold items
                </p>
              </div>

              <span className="bg-cream-200 text-forest-700 px-4 py-2 rounded-full text-lg font-bold">
                {groupedItems.fridge.length}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {renderItemList(
                "fridge",
                <Refrigerator className="w-16 h-16 text-ink-400 mx-auto mb-3" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}