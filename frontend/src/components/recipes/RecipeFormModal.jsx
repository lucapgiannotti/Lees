import React, { useState } from 'react'
import { MEAD_STYLES } from '../../utils/constants'

export default function RecipeFormModal({ isOpen, onClose, recipe, onSubmit, onDelete, title }) {
  // Initialize state directly using a function to avoid cascading renders
  const [form, setForm] = useState(() => {
    if (recipe) {
      // Deep copy recipe
      const parsed = JSON.parse(JSON.stringify(recipe))
      const isCustomStyle =
        parsed.style && !MEAD_STYLES.includes(parsed.style) && parsed.style !== 'Other'
      parsed.custom_style = isCustomStyle ? parsed.style : ''
      parsed.style = isCustomStyle ? 'Other' : parsed.style || ''
      return parsed
    } else {
      // New recipe blueprint
      return {
        name: '',
        style: '',
        custom_style: '',
        source: '',
        total_volume_gal: 1.0,
        target_og: 1.0,
        target_fg_low: 0.99,
        target_fg_high: 1.0,
        ingredients: [],
        method_markdown: '',
        notes_markdown: '',
      }
    }
  })

  if (!isOpen || !form) return null

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...form.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setForm({ ...form, ingredients: newIngredients })
  }

  const removeIngredient = (index) => {
    const newIngredients = form.ingredients.filter((_, i) => i !== index)
    setForm({ ...form, ingredients: newIngredients })
  }

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [
        ...form.ingredients,
        { name: '', amount: 0, unit: 'g', scalable: true, notes: '' },
      ],
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      style: form.style === 'Other' ? form.custom_style : form.style,
    }
    delete payload.custom_style
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-3xl my-8">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-xl text-on-surface">{title || 'Recipe Template'}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-6 text-on-surface max-h-[70vh] overflow-y-auto"
        >
          {/* Meta Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Style
              </label>
              <select
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3 text-on-surface"
                required
              >
                <option value="" disabled>
                  Select Style
                </option>
                {MEAD_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            {form.style === 'Other' && (
              <div className="flex flex-col gap-1 md:col-span-2 animate-fade-in -mt-2">
                <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                  Specify Style
                </label>
                <input
                  type="text"
                  value={form.custom_style}
                  onChange={(e) => setForm({ ...form, custom_style: e.target.value })}
                  className="bg-surface-container-low border border-primary rounded p-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Author/Source
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Base Vol (Gal)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.total_volume_gal}
                onChange={(e) => setForm({ ...form, total_volume_gal: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3"
                required
              />
            </div>
          </div>

          {/* Targets */}
          <div className="grid grid-cols-3 gap-4 border-t border-surface-container pt-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Target OG
              </label>
              <input
                type="number"
                step="0.001"
                value={form.target_og}
                onChange={(e) => setForm({ ...form, target_og: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                FG Low
              </label>
              <input
                type="number"
                step="0.001"
                value={form.target_fg_low}
                onChange={(e) => setForm({ ...form, target_fg_low: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                FG High
              </label>
              <input
                type="number"
                step="0.001"
                value={form.target_fg_high}
                onChange={(e) => setForm({ ...form, target_fg_high: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3"
                required
              />
            </div>
          </div>

          {/* Ingredients Editor */}
          <div className="border-t border-surface-container pt-4">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Ingredients
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-primary font-label-sm uppercase text-xs hover:underline"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-3">
              {form.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-start bg-surface-container-low p-3 rounded border border-outline-variant"
                >
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Name"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Amount"
                      value={ing.amount}
                      onChange={(e) =>
                        handleIngredientChange(idx, 'amount', parseFloat(e.target.value) || 0)
                      }
                      className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Unit (lbs, g)"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={ing.scalable}
                        onChange={(e) => handleIngredientChange(idx, 'scalable', e.target.checked)}
                        className="rounded border-outline-variant"
                      />
                      Scales?
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="text-error hover:bg-error-container p-2 rounded"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Markdown Sections */}
          <div className="border-t border-surface-container pt-4 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Method
              </label>
              <textarea
                rows="6"
                value={form.method_markdown}
                onChange={(e) => setForm({ ...form, method_markdown: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3 font-body-md"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Notes
              </label>
              <textarea
                rows="4"
                value={form.notes_markdown}
                onChange={(e) => setForm({ ...form, notes_markdown: e.target.value })}
                className="bg-surface-container-low border border-outline-variant rounded p-3 font-body-md"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-2 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-surface-container gap-4">
            {recipe ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-error font-label-sm uppercase px-4 py-2 flex items-center gap-1 hover:bg-error-container rounded transition-colors w-full sm:w-auto justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span> Delete Recipe
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-outline font-label-sm uppercase rounded hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-sm uppercase px-6 py-3 rounded hover:opacity-90 transition-opacity"
              >
                Save Recipe
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
