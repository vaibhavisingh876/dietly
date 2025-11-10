// src/pages/Pantry.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, ChefHat, Refrigerator, Utensils, Sparkles, Search } from 'lucide-react';
import Nav from '../components/Nav';

const BASE_URL = "http://localhost:5000/api/pantry";
const AI_URL = "http://localhost:5000/api/ai/suggest";

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', category: 'kitchen', quantity: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const userId = "6700b8d7a9e3f4cabc123456"; // replace with actual logged-in user
      const res = await fetch(`${BASE_URL}/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch pantry items");
      const data = await res.json();
      const pantryData = data.pantry || { kitchen: [], fridge: [] };
      const allItems = [
        ...(pantryData.kitchen?.map(i => ({ ...i, category: "kitchen" })) || []),
        ...(pantryData.fridge?.map(i => ({ ...i, category: "fridge" })) || []),
      ];
      setItems(allItems);
    } catch (error) {
      console.error("Error loading pantry:", error);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.quantity.trim()) return;
    try {
      const userId = "6700b8d7a9e3f4cabc123456";
      const res = await fetch(`${BASE_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category: newItem.category,
          items: [
            {
              name: newItem.name,
              quantity: newItem.quantity,
              addedAt: new Date().toISOString(),
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      const data = await res.json();
      const backendItem = data.items?.[0];
      if (backendItem) setItems(prev => [...prev, { ...backendItem, category: newItem.category }]);
      setNewItem({ name: "", category: "kitchen", quantity: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ Error adding item:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("❌ Error deleting item:", error);
    }
  };

  const generateMealSuggestions = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);
    try {
      const ingredients = items.map(i => i.name);
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      if (!res.ok) throw new Error("Failed to fetch AI recipes");

      const data = await res.json();
      if (data.success && Array.isArray(data.recipes)) {
        setSuggestedMeals(data.recipes);
      } else {
        console.error("AI Suggestion Error:", data.error || "No recipes returned");
        setSuggestedMeals([]); // reset to avoid blank page
      }
    } catch (error) {
      console.error("❌ Error generating AI meals:", error);
      setSuggestedMeals([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <Nav currentPage="Pantry" />
      <div style={{ height: '100px' }}></div>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4 bg-white px-8 py-4 rounded-2xl shadow-lg">
              <ChefHat className="w-12 h-12 text-emerald-600" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                Smart Pantry
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your ingredients and discover AI-generated meals you can cook right now
            </p>
          </div>

          {/* Stats & Actions */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-green-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">{items.length}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{groupedItems.kitchen?.length || 0}</p>
                  <p className="text-sm text-gray-600">Kitchen</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-600">{groupedItems.fridge?.length || 0}</p>
                  <p className="text-sm text-gray-600">Fridge</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add Item
                </button>
                <button
                  onClick={generateMealSuggestions}
                  disabled={items.length === 0 || isGenerating}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Suggest Meals'}
                </button>
              </div>
            </div>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-emerald-200 transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Add New Item</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Item name (e.g., Eggs)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors bg-white"
                >
                  <option value="kitchen">🍳 Kitchen</option>
                  <option value="fridge">❄️ Refrigerator</option>
                </select>
                <input
                  type="text"
                  placeholder="Quantity (e.g., 12 pieces)"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <button
                onClick={addItem}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg font-semibold text-lg"
              >
                Add to Pantry
              </button>
            </div>
          )}

          {/* Search Bar */}
          {items.length > 0 && (
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors bg-white shadow-md"
                />
              </div>
            </div>
          )}

          {/* AI Meal Suggestions */}
          {Array.isArray(suggestedMeals) && suggestedMeals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-amber-500" />
                AI-Generated Meals & Recipes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedMeals.map((meal, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl p-6 border-2 border-amber-100 hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{meal.name || "Unnamed Meal"}</h3>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {meal.difficulty || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 mb-2">🕐 {meal.cookTime || "N/A"}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Ingredients:</p>
                      <div className="space-y-1">
                        {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
                          meal.ingredients.map((ing, i) => (
                            <p key={i} className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                              ✓ {ing}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400">No ingredients listed</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mt-2">Recipe:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{meal.recipe || "No recipe available"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pantry Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kitchen */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-xl p-8 border-2 border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Utensils className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">Kitchen</h2>
                  <p className="text-sm text-gray-500">Pantry essentials</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-lg font-bold">
                  {groupedItems.kitchen?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {groupedItems.kitchen?.length > 0 ? (
                  groupedItems.kitchen.map(item => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      </div>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">No items yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Refrigerator */}
            <div className="bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-xl p-8 border-2 border-teal-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-100 p-3 rounded-xl">
                  <Refrigerator className="w-7 h-7 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">Refrigerator</h2>
                  <p className="text-sm text-gray-500">Fresh & cold items</p>
                </div>
                <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-lg font-bold">
                  {groupedItems.fridge?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {groupedItems.fridge?.length > 0 ? (
                  groupedItems.fridge.map(item => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-teal-100 hover:border-teal-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      </div>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Refrigerator className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">No items yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
