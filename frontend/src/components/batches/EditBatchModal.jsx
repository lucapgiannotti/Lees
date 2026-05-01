import React, { useState } from 'react'
import { MEAD_STYLES, SWEETNESS_LEVELS } from '../../utils/constants'

export default function EditBatchModal({ isOpen, onClose, batch, onSubmit, onDelete }) {
  const [editForm, setEditForm] = useState(() => {
    if (!batch) {
      return {
        name: '',
        style: '',
        custom_style: '',
        recipe: '',
        honey_varietal: '',
        nutrient_protocol: '',
        yeast: '',
        target_abv: '',
        sweetness: '',
        yield_bottles: 0,
        remaining_bottles: 0,
      }
    }

    const isCustomStyle =
      batch.style && !MEAD_STYLES.includes(batch.style) && batch.style !== 'Other'

    return {
      name: batch.name || '',
      style: isCustomStyle ? 'Other' : batch.style || '',
      custom_style: isCustomStyle ? batch.style : '',
      recipe: batch.recipe || '',
      honey_varietal: batch.honey_varietal || '',
      nutrient_protocol: batch.nutrient_protocol || '',
      yeast: batch.yeast || '',
      target_abv: batch.target_abv || '',
      sweetness: batch.sweetness || '',
      yield_bottles: batch.yield_bottles || 0,
      remaining_bottles: batch.remaining_bottles || 0,
    }
  })

  if (!isOpen || !batch) return null

  const isBottled = batch.status === 'BOTTLED' || batch.status === 'ARCHIVED'

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...editForm,
      style: editForm.style === 'Other' ? editForm.custom_style : editForm.style,
    }
    delete payload.custom_style
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-xl text-on-surface">Edit Batch Settings</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-4 text-on-surface max-h-[80vh] overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label-sm uppercase text-on-surface-variant">
              Batch Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                Style
              </label>
              <select
                value={editForm.style}
                onChange={(e) => setEditForm({ ...editForm, style: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
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
            {editForm.style === 'Other' && (
              <div className="flex flex-col gap-1 md:col-span-2 animate-fade-in">
                <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                  Specify Style
                </label>
                <input
                  type="text"
                  value={editForm.custom_style}
                  onChange={(e) => setEditForm({ ...editForm, custom_style: e.target.value })}
                  className="bg-surface-container-lowest border border-primary rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                Recipe
              </label>
              <input
                type="text"
                value={editForm.recipe}
                onChange={(e) => setEditForm({ ...editForm, recipe: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                Honey Varietal
              </label>
              <input
                type="text"
                value={editForm.honey_varietal}
                onChange={(e) => setEditForm({ ...editForm, honey_varietal: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                Yeast
              </label>
              <input
                type="text"
                value={editForm.yeast}
                onChange={(e) => setEditForm({ ...editForm, yeast: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                Sweetness Target
              </label>
              <select
                value={editForm.sweetness}
                onChange={(e) => setEditForm({ ...editForm, sweetness: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
              >
                <option value="">Unspecified</option>
                {SWEETNESS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                Nutrient Protocol
              </label>
              <input
                type="text"
                value={editForm.nutrient_protocol}
                onChange={(e) => setEditForm({ ...editForm, nutrient_protocol: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {isBottled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                  Total Bottles (Yield)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.yield_bottles}
                  onChange={(e) => setEditForm({ ...editForm, yield_bottles: e.target.value })}
                  className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-label-sm uppercase text-on-surface-variant">
                  Remaining Bottles
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.remaining_bottles}
                  onChange={(e) => setEditForm({ ...editForm, remaining_bottles: e.target.value })}
                  className="bg-surface-container-lowest border border-outline-variant rounded p-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-surface-container gap-4">
            <button type="button" onClick={onDelete} className="text-error font-label-sm uppercase">
              Delete Batch
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-outline rounded font-label-sm uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-sm uppercase px-6 py-3 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
