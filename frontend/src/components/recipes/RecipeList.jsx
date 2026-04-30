import React from 'react'

export default function RecipeList({ recipes, onSelectRecipe, onOpenNewRecipe }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold">Cookbook</h1>
          <p className="text-on-surface-variant">Standardized library for the meadmaker.</p>
        </div>
        <button
          onClick={onOpenNewRecipe}
          className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm uppercase tracking-widest flex items-center gap-2 w-fit hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">add</span> New Recipe
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            className="group cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded font-label-sm text-[10px] uppercase">
                {recipe.style}
              </span>
            </div>
            <h3 className="font-headline-sm text-xl group-hover:text-primary transition-colors">
              {recipe.name}
            </h3>
            <p className="text-on-surface-variant text-sm mt-1">Source: {recipe.source}</p>
            <div className="mt-4 flex gap-4 text-center">
              <div className="flex-1 border-r border-surface-container">
                <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                  Base Vol
                </p>
                <p className="font-metric-md font-bold">{recipe.total_volume_gal}g</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                  Target OG
                </p>
                <p className="font-metric-md font-bold">{recipe.target_og}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
