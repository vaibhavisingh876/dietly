import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, ChefHat, Refrigerator, Utensils, Sparkles, Search } from 'lucide-react';
import Nav from '../components/Nav';

const BASE_URL = "http://localhost:5000/api/Pantry";


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
    const userId = "6700b8d7a9e3f4cabc123456"; // temporarily hardcoded (replace with actual logged-in user ID)
    const res = await fetch(`http://localhost:5000/api/pantry/user/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch pantry items");

    const data = await res.json();
    const allItems = [
      ...data.pantry.kitchen.map(i => ({ ...i, category: "kitchen" })),
      ...data.pantry.fridge.map(i => ({ ...i, category: "fridge" })),
    ];
    setItems(allItems);
  } catch (error) {
    console.error("Error loading pantry:", error);
  }
};

const saveItems = async (updatedItems) => {
  try {
    setItems(updatedItems);
    const userId = "6700b8d7a9e3f4cabc123456"; // replace with actual userId (from auth)
    const kitchen = updatedItems.filter(i => i.category === "kitchen");
    const fridge = updatedItems.filter(i => i.category === "fridge");

    const res = await fetch(`http://localhost:5000/api/pantry/user/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kitchen, fridge }),
    });

    if (!res.ok) throw new Error("Failed to save pantry items");
    const data = await res.json();
    console.log("✅ Pantry updated:", data);
  } catch (error) {
    console.error("❌ Failed to save items:", error);
  }
};

const addItem = async () => {
  if (newItem.name.trim() && newItem.quantity.trim()) {
    try {
      const userId = "6700b8d7a9e3f4cabc123456"; // replace later with logged-in user's id

      // backend ko bhejne ke liye ek single item
      const res = await fetch(`http://localhost:5000/api/pantry/add`, {
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
      console.log("✅ Item added:", data);

      // frontend state update karo
      const updatedItems = [...items, { ...newItem, id: Date.now() }];
      setItems(updatedItems);
      setNewItem({ name: "", category: "kitchen", quantity: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ Error adding item:", error);
    }
  }
};

const deleteItem = async (id) => {
  try {
    // backend call (optional, if you want real deletion)
    const res = await fetch(`http://localhost:5000/api/pantry/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete item");
    console.log("🗑️ Item deleted successfully");

    // frontend state update karo
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
  } catch (error) {
    console.error("❌ Error deleting item:", error);
  }
};

  const generateMealSuggestions = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const ingredients = items.map(item => item.name.toLowerCase());
      const meals = [];

      if (ingredients.some(i => i.includes('rice') || i.includes('pasta'))) {
        meals.push({
          name: 'Vegetable Stir-fry Bowl',
          ingredients: items.filter(i => 
            i.name.toLowerCase().includes('rice') || 
            i.name.toLowerCase().includes('vegetables') ||
            i.name.toLowerCase().includes('carrot') ||
            i.name.toLowerCase().includes('onion')
          ).map(i => i.name),
          cookTime: '25 mins',
          difficulty: 'Easy'
        });
      }

      if (ingredients.some(i => i.includes('egg') || i.includes('eggs'))) {
        meals.push({
          name: 'Classic Omelet',
          ingredients: items.filter(i => 
            i.name.toLowerCase().includes('egg') || 
            i.name.toLowerCase().includes('cheese') ||
            i.name.toLowerCase().includes('milk')
          ).map(i => i.name),
          cookTime: '10 mins',
          difficulty: 'Easy'
        });
      }

      if (ingredients.some(i => i.includes('chicken') || i.includes('meat'))) {
        meals.push({
          name: 'Grilled Protein with Sides',
          ingredients: items.filter(i => 
            i.name.toLowerCase().includes('chicken') || 
            i.name.toLowerCase().includes('meat') ||
            i.name.toLowerCase().includes('spice')
          ).map(i => i.name),
          cookTime: '35 mins',
          difficulty: 'Medium'
        });
      }

      if (ingredients.some(i => i.includes('bread') || i.includes('toast'))) {
        meals.push({
          name: 'Gourmet Toast',
          ingredients: items.filter(i => 
            i.name.toLowerCase().includes('bread') || 
            i.name.toLowerCase().includes('toast') ||
            i.name.toLowerCase().includes('butter') ||
            i.name.toLowerCase().includes('jam')
          ).map(i => i.name),
          cookTime: '5 mins',
          difficulty: 'Easy'
        });
      }

      if (meals.length === 0) {
        meals.push({
          name: 'Creative Kitchen Mix',
          ingredients: items.slice(0, 4).map(i => i.name),
          cookTime: '30 mins',
          difficulty: 'Medium'
        });
      }

      setSuggestedMeals(meals);
      setIsGenerating(false);
    }, 1500);
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
              Track your ingredients and discover delicious meals you can cook right now
            </p>
          </div>

          {/* Stats & Actions Bar */}
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
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors bg-white"
                >
                  <option value="kitchen">🍳 Kitchen</option>
                  <option value="fridge">❄️ Refrigerator</option>
                </select>
                <input
                  type="text"
                  placeholder="Quantity (e.g., 12 pieces)"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
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

          {/* Meal Suggestions */}
          {suggestedMeals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-amber-500" />
                Suggested Meals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedMeals.map((meal, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl p-6 border-2 border-amber-100 hover:shadow-2xl transition-all transform hover:scale-105">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{meal.name}</h3>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {meal.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 mb-4 flex items-center gap-1">
                      <span className="font-semibold">🕐 {meal.cookTime}</span>
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Ingredients:</p>
                      <div className="space-y-1">
                        {meal.ingredients.map((ing, i) => (
                          <p key={i} className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">✓ {ing}</p>
                        ))}
                      </div>
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
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
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
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-teal-100 hover:border-teal-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
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

          {items.length === 0 && (
            <div className="text-center mt-16 bg-white rounded-3xl p-12 shadow-xl">
              <ChefHat className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Your pantry is empty</h3>
              <p className="text-gray-500 mb-6">Start by adding some items to discover amazing meal ideas!</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Your First Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
