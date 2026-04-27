// src/pages/Recipes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [desiredVolume, setDesiredVolume] = useState(1.0);
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetchRecipes = () => {
    fetch('http://localhost:8000/api/recipes')
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(err => console.error("Error fetching recipes:", err));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleBrewThis = () => {
    // Standard ABV formula: (OG - FG) * 131.25
    const averageFg = (selectedRecipe.target_fg_low + selectedRecipe.target_fg_high) / 2;
    const calculatedAbv = ((selectedRecipe.target_og - averageFg) * 131.25).toFixed(1);

    const prefill = {
      name: `${selectedRecipe.name} (Batch)`,
      style: selectedRecipe.style,
      volume_gal: desiredVolume,
      target_og: selectedRecipe.target_og,
      target_abv: parseFloat(calculatedAbv),
      recipe: selectedRecipe.source || "Lees Cookbook"
    };

    navigate('/batches', { state: { prefill, autoOpen: true } });
  };

  // --- EDIT LOGIC ---
  const openEditModal = () => {
    // Deep copy to prevent state mutation on the ingredients array
    setEditForm(JSON.parse(JSON.stringify(selectedRecipe)));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/recipes/${selectedRecipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          total_volume_gal: parseFloat(editForm.total_volume_gal),
          target_og: parseFloat(editForm.target_og),
          target_fg_low: parseFloat(editForm.target_fg_low),
          target_fg_high: parseFloat(editForm.target_fg_high)
        })
      });

      if (response.ok) {
        const updatedRecipe = await response.json();
        setSelectedRecipe(updatedRecipe);
        setIsEditModalOpen(false);
        fetchRecipes();
      }
    } catch (err) {
      console.error("Error updating recipe:", err);
    }
  };

  const handleDeleteRecipe = async () => {
    if (window.confirm(`Permanently delete "${selectedRecipe.name}"?`)) {
      await fetch(`http://localhost:8000/api/recipes/${selectedRecipe.id}`, { method: 'DELETE' });
      setIsEditModalOpen(false);
      setSelectedRecipe(null);
      fetchRecipes();
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...editForm.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setEditForm({ ...editForm, ingredients: newIngredients });
  };

  const removeIngredient = (index) => {
    const newIngredients = editForm.ingredients.filter((_, i) => i !== index);
    setEditForm({ ...editForm, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setEditForm({
      ...editForm,
      ingredients: [...editForm.ingredients, { name: "", amount: 0, unit: "g", scalable: true, notes: "" }]
    });
  };

  // --- DETAIL VIEW ---
  if (selectedRecipe) {
    const multiplier = desiredVolume / selectedRecipe.total_volume_gal;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-sm uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Cookbook
          </button>
          <button onClick={openEditModal} className="bg-surface-container-lowest border border-outline text-on-surface px-4 py-2 rounded font-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors">
            Edit Recipe
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Recipe Info & Scaling */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h1 className="font-headline-md text-2xl mb-2">{selectedRecipe.name}</h1>
              <p className="text-on-surface-variant font-body-md mb-4">By {selectedRecipe.source}</p>
              
              <div className="space-y-4 pt-4 border-t border-surface-container">
                <div>
                  <label className="font-label-sm text-primary uppercase text-[10px]">Desired Volume (Gallons)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={desiredVolume} 
                    onChange={(e) => setDesiredVolume(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded p-3 mt-1 font-metric-xl text-xl"
                  />
                </div>
                <button 
                  onClick={handleBrewThis}
                  className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">shutter_speed</span> Brew This Recipe
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
              <h3 className="font-label-sm uppercase text-on-surface-variant mb-4">Targets</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">OG</p>
                  <p className="font-metric-lg text-lg font-bold">{selectedRecipe.target_og}</p>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">FG Range</p>
                  <p className="font-metric-lg text-sm font-bold">{selectedRecipe.target_fg_low} - {selectedRecipe.target_fg_high}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Ingredients & Method */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-container">
                <h2 className="font-headline-sm text-lg">Ingredients</h2>
              </div>
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-[10px] uppercase font-label-sm text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {selectedRecipe.ingredients.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-body-md font-bold">{item.name}</td>
                      <td className="px-6 py-4 font-metric-md text-primary">
                        {item.scalable ? (item.amount * multiplier).toFixed(2) : item.amount} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant italic">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="font-headline-sm text-lg mb-4">Method</h2>
              <div className="prose prose-slate max-w-none text-on-surface-variant">
                <pre className="whitespace-pre-wrap font-body-md bg-transparent p-0 m-0">
                  {selectedRecipe.method_markdown}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* --- EDIT MODAL --- */}
        {isEditModalOpen && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-3xl my-8">
              <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-md text-xl text-on-surface">Edit Recipe Template</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-6 text-on-surface max-h-[70vh] overflow-y-auto">
                {/* Meta Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" required /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Style</label><input type="text" value={editForm.style} onChange={e => setEditForm({...editForm, style: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" required /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Author/Source</label><input type="text" value={editForm.source} onChange={e => setEditForm({...editForm, source: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Base Vol (Gal)</label><input type="number" step="0.1" value={editForm.total_volume_gal} onChange={e => setEditForm({...editForm, total_volume_gal: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" required /></div>
                </div>

                {/* Targets */}
                <div className="grid grid-cols-3 gap-4 border-t border-surface-container pt-4">
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Target OG</label><input type="number" step="0.001" value={editForm.target_og} onChange={e => setEditForm({...editForm, target_og: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" required /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">FG Low</label><input type="number" step="0.001" value={editForm.target_fg_low} onChange={e => setEditForm({...editForm, target_fg_low: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" required /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">FG High</label><input type="number" step="0.001" value={editForm.target_fg_high} onChange={e => setEditForm({...editForm, target_fg_high: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3" required /></div>
                </div>

                {/* Ingredients Editor */}
                <div className="border-t border-surface-container pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Ingredients JSON Data</label>
                    <button type="button" onClick={addIngredient} className="text-primary font-label-sm uppercase text-xs hover:underline">+ Add Item</button>
                  </div>
                  <div className="space-y-3">
                    {editForm.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-surface-container-low p-3 rounded border border-outline-variant">
                        <div className="grid grid-cols-4 gap-2 flex-1">
                          <input type="text" placeholder="Name" value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm" />
                          <input type="number" step="0.1" placeholder="Amount" value={ing.amount} onChange={e => handleIngredientChange(idx, 'amount', parseFloat(e.target.value) || 0)} className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm" />
                          <input type="text" placeholder="Unit (lbs, g)" value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm" />
                          <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <input type="checkbox" checked={ing.scalable} onChange={e => handleIngredientChange(idx, 'scalable', e.target.checked)} className="rounded border-outline-variant" />
                            Scales?
                          </label>
                        </div>
                        <button type="button" onClick={() => removeIngredient(idx)} className="text-error hover:bg-error-container p-2 rounded"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Markdown Sections */}
                <div className="border-t border-surface-container pt-4 space-y-4">
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Method (Markdown)</label><textarea rows="6" value={editForm.method_markdown} onChange={e => setEditForm({...editForm, method_markdown: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3 font-body-md" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[10px] uppercase font-label-sm text-on-surface-variant">Notes (Markdown)</label><textarea rows="4" value={editForm.notes_markdown} onChange={e => setEditForm({...editForm, notes_markdown: e.target.value})} className="bg-surface-container-low border border-outline-variant rounded p-3 font-body-md" /></div>
                </div>

                {/* Footer Controls */}
                <div className="mt-2 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-surface-container gap-4 sticky bottom-0 bg-surface-container-lowest">
                  <button type="button" onClick={handleDeleteRecipe} className="text-error font-label-sm uppercase px-4 py-2 flex items-center gap-1 hover:bg-error-container rounded transition-colors w-full sm:w-auto justify-center"><span className="material-symbols-outlined text-[18px]">delete</span> Delete Recipe</button>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 border border-outline font-label-sm uppercase rounded hover:bg-surface-container transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary text-on-primary font-label-sm uppercase px-6 py-3 rounded hover:opacity-90 transition-opacity">Save Changes</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold">Cookbook</h1>
          <p className="text-on-surface-variant">Standardized library for the precision meadmaker.</p>
        </div>
        {/* Placeholder for a "New Recipe" button in the future */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div 
            key={recipe.id} 
            onClick={() => { setSelectedRecipe(recipe); setDesiredVolume(recipe.total_volume_gal); }}
            className="group cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded font-label-sm text-[10px] uppercase">
                {recipe.style}
              </span>
            </div>
            <h3 className="font-headline-sm text-xl group-hover:text-primary transition-colors">{recipe.name}</h3>
            <p className="text-on-surface-variant text-sm mt-1">Source: {recipe.source}</p>
            <div className="mt-4 flex gap-4 text-center">
              <div className="flex-1 border-r border-surface-container">
                <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">Base Vol</p>
                <p className="font-metric-md font-bold">{recipe.total_volume_gal}g</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">Target OG</p>
                <p className="font-metric-md font-bold">{recipe.target_og}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}