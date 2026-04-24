// src/pages/Inventory.jsx
import React, { useState } from 'react';

// --- MOCK DATA ---
// --- MOCK DATA ---
const initialInventory = [
  // Honey
  { id: "1", name: "Orange Blossom Honey", category: "Honey", current: 8, desired: 15, unit: "lbs" },
  { id: "2", name: "Wildflower Honey", category: "Honey", current: 2, desired: 10, unit: "lbs" },
  
  // Yeasts
  { id: "3", name: "Lalvin V1116", category: "Yeast", current: 4, desired: 5, unit: "packets" },
  { id: "4", name: "Lalvin 71B", category: "Yeast", current: 1, desired: 5, unit: "packets" },
  
  // Nutrients & Additives
  { id: "5", name: "Fermaid O", category: "Nutrients", current: 45, desired: 100, unit: "grams" },
  { id: "6", name: "Pectic Enzyme", category: "Additives", current: 15, desired: 30, unit: "grams" },
  { id: "7", name: "Tartaric Acid", category: "Additives", current: 50, desired: 50, unit: "grams" },
  
  // Stabilizers & Clarifiers
  { id: "8", name: "Campden Tablets (K-Meta)", category: "Stabilizers", current: 12, desired: 50, unit: "tablets" },
  { id: "9", name: "Potassium Sorbate", category: "Stabilizers", current: 20, desired: 50, unit: "grams" },
  { id: "10", name: "Bentonite", category: "Clarifiers", current: 0, desired: 100, unit: "grams" }, 
  
  // Packaging 
  { id: "11", name: "Clear Wine Bottles (750ml)", category: "Packaging", current: 12, desired: 30, unit: "bottles" },
  { id: "12", name: "#8 Natural Corks", category: "Packaging", current: 45, desired: 100, unit: "corks" },
  
  // Cleaning
  { id: "13", name: "Star San", category: "Sanitizer", current: 16, desired: 32, unit: "oz" },
  
  // Fruits & Mix-ins 
  { id: "14", name: "Frozen Raspberries", category: "Fruits", current: 3, desired: 5, unit: "lbs" },
  { id: "15", name: "Cinnamon Sticks", category: "Mix-ins", current: 8, desired: 10, unit: "sticks" },

  // Consumable Hardware
  { id: "16", name: "3-Piece Airlocks", category: "Hardware", current: 2, desired: 6, unit: "pcs" },
  { id: "17", name: "#6.5 Rubber Bungs", category: "Hardware", current: 3, desired: 6, unit: "pcs" },
];

const getStatusColor = (current, desired) => {
  if (current === 0) return "bg-error-container text-on-error-container";
  if (current <= desired * 0.3) return "bg-tertiary-container text-on-tertiary-container";
  return "bg-secondary-container text-on-secondary-container";
};

const getProgressColor = (current, desired) => {
  if (current === 0) return "bg-error";
  if (current <= desired * 0.3) return "bg-tertiary";
  return "bg-secondary";
};

export default function Inventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [activeCategory, setActiveCategory] = useState("All");
  const [editingItem, setEditingItem] = useState(null);

  // This automatically ensures only categories with at least 1 item are shown
  const uniqueCategories = [...new Set(inventory.map(item => item.category))];
  const categories = ["All", ...uniqueCategories];

  const filteredInventory = activeCategory === "All" 
    ? inventory 
    : inventory.filter(item => item.category === activeCategory);

  const adjustStock = (id, amount) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.current + amount);
        return { ...item, current: newStock };
      }
      return item;
    }));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setInventory(inventory.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Inventory</h2>
          <p className="font-body-lg text-lg text-on-surface-variant mt-1">Manage your ingredients, chemicals, and hardware.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-sm">add</span>
          Add Item
        </button>
      </header>

      {/* Category Filters */}
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full font-label-sm uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeCategory === category 
                ? "bg-surface-container-high text-primary border border-outline-variant" 
                : "bg-surface-container-lowest text-on-surface-variant border border-outline hover:bg-surface-container"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-surface-container bg-surface-container-low font-label-sm text-on-surface-variant uppercase tracking-widest">
          <div className="col-span-4">Item Name</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-3">Stock Level</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-surface-container">
          {filteredInventory.map((item) => {
            const percent = Math.min(100, (item.current / item.desired) * 100);
            
            return (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container-low transition-colors">
                
                <div className="col-span-4 flex flex-col items-start gap-1">
                  <p className="font-headline-md text-lg text-on-surface">{item.name}</p>
                  <span className={`px-2 py-0.5 font-label-sm text-[10px] uppercase rounded ${getStatusColor(item.current, item.desired)}`}>
                    {item.current === 0 ? "Out of Stock" : item.current <= item.desired * 0.3 ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                <div className="col-span-2 hidden md:block font-body-md text-on-surface-variant">
                  {item.category}
                </div>

                <div className="col-span-3 flex flex-col gap-2">
                  <div className="flex justify-between font-label-sm text-on-surface-variant text-xs">
                    <span>{item.current} {item.unit}</span>
                    <span>Target: {item.desired}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div 
                      className={`${getProgressColor(item.current, item.desired)} h-2 rounded-full transition-all duration-300`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3 mt-4 md:mt-0">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-surface-container"
                    title="Edit Item Details"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>

                  <div className="bg-surface-container border border-outline-variant rounded flex items-center overflow-hidden">
                    <button 
                      onClick={() => adjustStock(item.id, -1)}
                      className="px-3 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="font-body-md font-medium px-2 min-w-[3ch] text-center">{item.current}</span>
                    <button 
                      onClick={() => adjustStock(item.id, 1)}
                      className="px-3 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* The Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            
            <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-xl text-on-surface">Edit Item</h3>
              <button onClick={() => setEditingItem(null)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-5">
              
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-on-surface-variant">ITEM NAME</label>
                <input 
                  type="text" 
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              {/* REPLACED: Text input is now a styled select dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-on-surface-variant">CATEGORY</label>
                <div className="relative">
                  <select 
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                    required
                  >
                    {/* Maps over the active categories array to build options */}
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {/* Custom downward arrow */}
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-on-surface-variant">TARGET QUANTITY</label>
                  <input 
                    type="number" 
                    value={editingItem.desired}
                    onChange={(e) => setEditingItem({...editingItem, desired: parseInt(e.target.value) || 0})}
                    className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-on-surface-variant">UNIT</label>
                  <input 
                    type="text" 
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                    className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="lbs, grams, oz..."
                    required
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3 pt-4 border-t border-surface-container">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="flex-1 bg-surface-container-lowest border border-outline text-on-surface font-label-sm uppercase tracking-widest py-3 rounded hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-on-primary font-label-sm uppercase tracking-widest py-3 rounded hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}