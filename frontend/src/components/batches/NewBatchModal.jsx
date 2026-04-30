import React, { useState } from 'react'
import { MEAD_STYLES, SWEETNESS_LEVELS } from '../../utils/constants'

export default function NewBatchModal({ isOpen, onClose, onSubmit, initialData }) {
  const [newBatchForm, setNewBatchForm] = useState(() => {
    const isCustomStyle =
      initialData?.style &&
      !MEAD_STYLES.includes(initialData.style) &&
      initialData.style !== 'Other'

    return {
      name: initialData?.name || '',
      volume_gal: initialData?.volume_gal || 1.0,
      target_og: initialData?.target_og || '',
      recipe: initialData?.recipe || '',
      honey_varietal: initialData?.honey_varietal || '',
      nutrient_protocol: initialData?.nutrient_protocol || '',
      yeast: initialData?.yeast || '',
      sweetness: initialData?.sweetness || '',
      style: isCustomStyle ? 'Other' : initialData?.style || '',
      custom_style: isCustomStyle ? initialData?.style : '',
    }
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...newBatchForm,
      style: newBatchForm.style === 'Other' ? newBatchForm.custom_style : newBatchForm.style,
    }
    delete payload.custom_style

    onSubmit(payload)

    setNewBatchForm({
      name: '',
      style: '',
      custom_style: '',
      volume_gal: 1.0,
      target_og: '',
      recipe: '',
      honey_varietal: '',
      nutrient_protocol: '',
      yeast: '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-xl text-on-surface">Pitch New Batch</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-label-sm text-primary">Batch Name</label>
            <input
              type="text"
              required
              value={newBatchForm.name}
              onChange={(e) => setNewBatchForm({ ...newBatchForm, name: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
              Style
            </label>
            <select
              value={newBatchForm.style}
              onChange={(e) => setNewBatchForm({ ...newBatchForm, style: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded p-3 text-on-surface focus:outline-none focus:border-primary"
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

          {newBatchForm.style === 'Other' && (
            <div className="flex flex-col gap-1 -mt-2 animate-fade-in">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Specify Style
              </label>
              <input
                type="text"
                value={newBatchForm.custom_style}
                onChange={(e) => setNewBatchForm({ ...newBatchForm, custom_style: e.target.value })}
                className="bg-surface-container-lowest border border-primary rounded p-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Volume (Gal)
              </label>
              <input
                type="number"
                step="0.1"
                value={newBatchForm.volume_gal}
                onChange={(e) => setNewBatchForm({ ...newBatchForm, volume_gal: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Target OG
              </label>
              <input
                type="number"
                step="0.001"
                value={newBatchForm.target_og}
                onChange={(e) => setNewBatchForm({ ...newBatchForm, target_og: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Honey Varietal
              </label>
              <input
                type="text"
                value={newBatchForm.honey_varietal}
                onChange={(e) =>
                  setNewBatchForm({ ...newBatchForm, honey_varietal: e.target.value })
                }
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
                placeholder="e.g. Clover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
                Yeast
              </label>
              <input
                type="text"
                value={newBatchForm.yeast}
                onChange={(e) => setNewBatchForm({ ...newBatchForm, yeast: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
                placeholder="e.g. Lalvin 71B"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
              Nutrient Protocol
            </label>
            <input
              type="text"
              value={newBatchForm.nutrient_protocol}
              onChange={(e) =>
                setNewBatchForm({ ...newBatchForm, nutrient_protocol: e.target.value })
              }
              className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
              placeholder="e.g. TOSNA 3.0"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-label-sm text-on-surface-variant">
              Recipe Source
            </label>
            <input
              type="text"
              value={newBatchForm.recipe}
              onChange={(e) => setNewBatchForm({ ...newBatchForm, recipe: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary"
            />
          </div>
          <div className="pt-4 border-t border-surface-container flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-outline rounded-lg font-label-sm uppercase hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-on-primary rounded-lg font-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity py-3"
            >
              Launch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
