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
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import api from "../api/api";
import FadeContent from "../components/reactbits/FadeContent.jsx";
import SpotlightCard from "../components/reactbits/SpotlightCard.jsx";
import CountUp from "../components/reactbits/CountUp.jsx";

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

      const responseCategory = response.data?.pantry?.[newItem.category];

      if (Array.isArray(responseCategory)) {
        const addedItem = responseCategory[responseCategory.length - 1];

        if (addedItem?._id) {
          setItems((prev) => [
            ...prev,
            {
              ...addedItem,
              category: newItem.category,
            },
          ]);
        } else {
          await loadItems();
        }
      } else {
        await loadItems();
      }

      setNewItem(EMPTY_ITEM);
      setShowAddForm(false);
      setSuccessMessage("Item added to your pantry.");
    } catch (error) {
      console.error("Error adding item:", error);
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
          <p className="text-ink-400 text-sm">Loading items...</p>
        </div>
      );
    }

    if (categoryItems.length === 0) {
      return (
        <div className="text-center py-12 text-ink-400">
          {emptyIcon}
          <p className="text-sm mt-2">
            {searchTerm ? "No matching ingredients found" : "No items logged yet"}
          </p>
        </div>
      );
    }

    return categoryItems.map((item) => (
      <div
        key={item._id}
        className="flex items-center justify-between p-3.5 rounded-xl bg-cream-100/70 border border-cream-200 hover:border-forest-200 hover:bg-cream-100 transition-all shadow-sm"
      >
        <div className="flex-1 min-w-0 pr-3">
          <p className="font-semibold text-ink-800 text-sm sm:text-base truncate">
            {item.name}
          </p>
          <p className="text-xs text-ink-500 truncate mt-0.5">
            {item.quantity}
          </p>
        </div>

        <button
          type="button"
          onClick={() => deleteItem(item._id)}
          disabled={deletingId === item._id}
          aria-label={`Remove ${item.name}`}
          className="text-ink-400 hover:text-clay-600 p-2 hover:bg-clay-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {deletingId === item._id ? (
            <div className="w-4 h-4 border-2 border-clay-200 border-t-clay-600 rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    ));
  };

  return (
    <div className="min-h-screen dietly-page-bg px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeContent delay={0.05}>
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-forest-100 text-forest-700">
                <ChefHat className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
                  Smart Pantry & Kitchen
                </h1>
                <p className="text-ink-600 text-sm sm:text-base mt-0.5">
                  Keep track of what's in stock and generate AI recipes from your available ingredients.
                </p>
              </div>
            </div>
          </div>
        </FadeContent>

        {/* Alerts */}
        {error && (
          <FadeContent delay={0.05}>
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-sm text-sm font-medium">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          </FadeContent>
        )}

        {successMessage && (
          <FadeContent delay={0.05}>
            <div className="mb-6 flex items-start gap-3 bg-forest-50 border border-forest-200 text-forest-800 rounded-2xl p-4 shadow-sm text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{successMessage}</p>
            </div>
          </FadeContent>
        )}

        {/* Stats & Top Action Bar */}
        <FadeContent delay={0.1}>
          <SpotlightCard
            className="p-6 sm:p-7 mb-8 shadow-sm border-cream-300"
            spotlightColor="rgba(79, 115, 69, 0.12)"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-forest-700">
                    <CountUp to={items.length} duration={1} />
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-ink-500 mt-0.5">
                    Total Items
                  </p>
                </div>

                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-forest-600">
                    <CountUp to={groupedItems.kitchen.length} duration={1} />
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-ink-500 mt-0.5">
                    In Kitchen
                  </p>
                </div>

                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-teal-600">
                    <CountUp to={groupedItems.fridge.length} duration={1} />
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-ink-500 mt-0.5">
                    In Fridge
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setShowAddForm((prev) => !prev);
                  }}
                  className="flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddForm ? "Close Form" : "Add Item"}</span>
                </button>

                <button
                  type="button"
                  onClick={generateMealSuggestions}
                  disabled={items.length === 0 || isGenerating || isLoading}
                  className="flex items-center gap-2 bg-clay-500 hover:bg-clay-600 active:bg-clay-700 disabled:bg-clay-300 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? "Generating Recipes..." : "Suggest Meals"}</span>
                </button>
              </div>
            </div>
          </SpotlightCard>
        </FadeContent>

        {/* Add Item Form */}
        {showAddForm && (
          <FadeContent delay={0.05}>
            <SpotlightCard
              className="p-6 sm:p-7 mb-8 shadow-md border-forest-300"
              spotlightColor="rgba(79, 115, 69, 0.15)"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Add Ingredient to Pantry
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    clearMessages();
                  }}
                  className="text-ink-400 hover:text-ink-700 p-1 rounded-lg"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Ingredient name (e.g. Sourdough bread)"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="border border-cream-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 bg-cream-100/60 transition-colors"
                />

                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="border border-cream-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 bg-cream-100/60 transition-colors"
                >
                  <option value="kitchen">🍳 Kitchen / Dry Pantry</option>
                  <option value="fridge">❄️ Refrigerator / Chilled</option>
                </select>

                <input
                  type="text"
                  maxLength={100}
                  placeholder="Quantity (e.g. 500g, 2 cans)"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="border border-cream-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 bg-cream-100/60 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={isAdding}
                className="w-full sm:w-auto px-8 py-3 bg-forest-700 hover:bg-forest-800 disabled:bg-forest-300 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
              >
                {isAdding ? "Adding Item..." : "Save to Inventory"}
              </button>
            </SpotlightCard>
          </FadeContent>
        )}

        {/* Search Bar */}
        {items.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search pantry ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 bg-cream-50 text-sm shadow-sm transition-colors"
              />
            </div>
          </div>
        )}

        {/* AI Suggested Meals */}
        {Array.isArray(suggestedMeals) && suggestedMeals.length > 0 && (
          <FadeContent delay={0.1}>
            <div className="mb-10">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-ink-900">
                    AI Recipe Suggestions
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSuggestedMeals([])}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-800 bg-cream-100 px-3 py-1.5 rounded-lg border border-cream-200 transition-colors"
                >
                  Clear Recipes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {suggestedMeals.map((meal, idx) => (
                  <SpotlightCard
                    key={`${meal.name || "meal"}-${idx}`}
                    className="p-6 border-amber-200/80 bg-cream-50/95 shadow-sm"
                    spotlightColor="rgba(193, 80, 46, 0.12)"
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        {meal.name || "Custom Recipe"}
                      </h3>
                      {meal.difficulty && (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
                          {meal.difficulty}
                        </span>
                      )}
                    </div>

                    {meal.cookTime && (
                      <div className="flex items-center gap-1.5 text-xs text-clay-600 mb-4 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{meal.cookTime}</span>
                      </div>
                    )}

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <p className="font-semibold text-ink-700 mb-1.5">
                          Ingredients:
                        </p>
                        <div className="space-y-1">
                          {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
                            meal.ingredients.map((ing, i) => (
                              <p key={i} className="text-ink-600 bg-cream-100/80 px-2.5 py-1 rounded-md">
                                • {ing}
                              </p>
                            ))
                          ) : (
                            <p className="text-ink-400">Pantry essentials</p>
                          )}
                        </div>
                      </div>

                      {meal.recipe && (
                        <div className="border-t border-cream-200 pt-3">
                          <p className="font-semibold text-ink-700 mb-1">
                            Preparation:
                          </p>
                          <p className="text-ink-600 leading-relaxed text-xs">
                            {meal.recipe}
                          </p>
                        </div>
                      )}
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </FadeContent>
        )}

        {/* Pantry Columns (Kitchen & Refrigerator) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kitchen */}
          <FadeContent delay={0.15}>
            <SpotlightCard
              className="p-6 sm:p-7 border-cream-300 shadow-sm"
              spotlightColor="rgba(79, 115, 69, 0.1)"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cream-200">
                <div className="bg-forest-100 p-2.5 rounded-xl text-forest-700">
                  <Utensils className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-ink-900">
                    Kitchen & Dry Goods
                  </h2>
                  <p className="text-xs text-ink-500">
                    Spices, grains, pantry staples
                  </p>
                </div>
                <span className="bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-sm font-bold">
                  {groupedItems.kitchen.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {renderItemList(
                  "kitchen",
                  <Utensils className="w-10 h-10 text-ink-300 mx-auto" />
                )}
              </div>
            </SpotlightCard>
          </FadeContent>

          {/* Refrigerator */}
          <FadeContent delay={0.2}>
            <SpotlightCard
              className="p-6 sm:p-7 border-cream-300 shadow-sm"
              spotlightColor="rgba(79, 115, 69, 0.1)"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cream-200">
                <div className="bg-teal-100/80 p-2.5 rounded-xl text-teal-700">
                  <Refrigerator className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-ink-900">
                    Refrigerator & Chilled
                  </h2>
                  <p className="text-xs text-ink-500">
                    Produce, dairy, proteins
                  </p>
                </div>
                <span className="bg-teal-100/80 text-teal-800 px-3 py-1 rounded-full text-sm font-bold">
                  {groupedItems.fridge.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {renderItemList(
                  "fridge",
                  <Refrigerator className="w-10 h-10 text-ink-300 mx-auto" />
                )}
              </div>
            </SpotlightCard>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}
