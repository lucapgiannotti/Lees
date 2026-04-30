import React, { useState } from 'react'

export default function RecipeDetail({ recipe, onBack, onEdit, onBrew }) {
  const [desiredVolume, setDesiredVolume] = useState(() => recipe?.total_volume_gal || 1.0)

  if (!recipe) return null

  const multiplier = desiredVolume / (recipe.total_volume_gal || 1.0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Cookbook
        </button>
        <button
          onClick={onEdit}
          className="bg-surface-container-lowest border border-outline text-on-surface px-4 py-2 rounded font-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors"
        >
          Edit Recipe
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Recipe Info & Scaling */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h1 className="font-headline-md text-2xl mb-2">{recipe.name}</h1>
            <p className="text-on-surface-variant font-body-md mb-4">By {recipe.source}</p>

            <div className="space-y-4 pt-4 border-t border-surface-container">
              <div>
                <label className="font-label-sm text-primary uppercase text-[10px]">
                  Desired Volume (Gallons)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={desiredVolume}
                  onChange={(e) => setDesiredVolume(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded p-3 mt-1 font-metric-xl text-xl"
                />
              </div>
              <button
                onClick={() => onBrew(desiredVolume)}
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
                <p className="font-metric-lg text-lg font-bold">{recipe.target_og}</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
                <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                  FG Range
                </p>
                <p className="font-metric-lg text-sm font-bold">
                  {recipe.target_fg_low} - {recipe.target_fg_high}
                </p>
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
                {recipe.ingredients.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 font-body-md font-bold">{item.name}</td>
                    <td className="px-6 py-4 font-metric-md text-primary">
                      {item.scalable ? (item.amount * multiplier).toFixed(2) : item.amount}{' '}
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant italic">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h2 className="font-headline-sm text-lg mb-4">Method</h2>
            <div className="prose prose-slate max-w-none text-on-surface-variant">
              <pre className="whitespace-pre-wrap font-body-md bg-transparent p-0 m-0">
                {recipe.method_markdown}
              </pre>
            </div>
          </div>

          {recipe.notes_markdown && recipe.notes_markdown.trim() !== '' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="font-headline-sm text-lg mb-4">Notes</h2>
              <div className="prose prose-slate max-w-none text-on-surface-variant">
                <pre className="whitespace-pre-wrap font-body-md bg-transparent p-0 m-0">
                  {recipe.notes_markdown}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
