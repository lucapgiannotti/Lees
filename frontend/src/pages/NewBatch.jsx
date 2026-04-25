// src/pages/NewBatch.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MEAD_STYLES = [
  'Traditional',
  'Melomel (Fruit)',
  'Cyser (Apple)',
  'Pyment (Grape)',
  'Metheglin (Spiced)',
  'Bochet (Caramelized)',
  'Braggot (Malt)',
  'Other',
]

export default function NewBatch() {
  const navigate = useNavigate()

  // Basic Details
  const [batchName, setBatchName] = useState('')
  const [meadType, setMeadType] = useState('Traditional')
  const [customMeadType, setCustomMeadType] = useState('') // For the "Other" option
  const [recipe, setRecipe] = useState('')
  const [yeast, setYeast] = useState('')
  const [volumeGal, setVolumeGal] = useState(1.0)

  // Calculator State
  const [calcMode, setCalcMode] = useState('ingredients') // 'ingredients' or 'target_abv'
  const [honeyLbs, setHoneyLbs] = useState(3.0)
  const [targetAbv, setTargetAbv] = useState(12.0)

  // --- FERMENTATION MATH ---
  const HONEY_PPG = 35

  let estOg = '1.000'
  let estAbv = '0.0'
  let requiredHoneyLbs = '0.00'

  if (volumeGal > 0) {
    if (calcMode === 'ingredients') {
      const gravityPoints = (honeyLbs * HONEY_PPG) / volumeGal
      const calculatedOg = 1 + gravityPoints / 1000
      estOg = calculatedOg.toFixed(3)
      estAbv = ((calculatedOg - 1) * 131.25).toFixed(1)
    } else {
      const targetOg = targetAbv / 131.25 + 1
      const pointsNeeded = (targetOg - 1) * 1000
      const totalPoints = pointsNeeded * volumeGal
      requiredHoneyLbs = (totalPoints / HONEY_PPG).toFixed(2)
      estOg = targetOg.toFixed(3)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Format the data to perfectly match our FastAPI Pydantic schema
    const payload = {
      name: batchName,
      style: meadType === 'Other' ? customMeadType : meadType,
      recipe: recipe || null,
      yeast: yeast || null,
      volume_gal: parseFloat(volumeGal),
      target_og: parseFloat(estOg),
      target_abv: parseFloat(estAbv) || parseFloat(targetAbv),
    }

    try {
      // 2. Send it to the backend
      const response = await fetch('http://localhost:8000/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // 3. If successful, route back to the main batches page
        navigate('/batches')
      } else {
        console.error('Failed to create batch')
      }
    } catch (error) {
      console.error('Error submitting batch:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-sm uppercase tracking-widest"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back
      </button>

      <header className="mb-8">
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Start New Batch</h2>
        <p className="font-body-lg text-lg text-on-surface-variant mt-1">
          Configure parameters and estimate target gravity.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* --- SECTION 1: Basic Information --- */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="font-headline-md text-xl border-b border-surface-container pb-3 mb-5">
            Batch Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch Name spans both columns */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-label-sm text-on-surface-variant">BATCH NAME</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g., Traditional #5, Spiced Apple Cyser..."
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            {/* The New Style Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-on-surface-variant">MEAD STYLE</label>
              <div className="relative">
                <select
                  value={meadType}
                  onChange={(e) => setMeadType(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  {MEAD_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-on-surface-variant">
                RECIPE / BASE (Optional)
              </label>
              <input
                type="text"
                value={recipe}
                onChange={(e) => setRecipe(e.target.value)}
                placeholder="e.g., Basic Traditional"
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Conditional "Other" Input */}
            {meadType === 'Other' && (
              <div className="flex flex-col gap-1 md:col-span-2 animate-fade-in">
                <label className="font-label-sm text-on-surface-variant text-primary">
                  SPECIFY STYLE
                </label>
                <input
                  type="text"
                  value={customMeadType}
                  onChange={(e) => setCustomMeadType(e.target.value)}
                  placeholder="e.g., Acerglyn, Rhodomel..."
                  className="bg-surface-container-lowest border border-primary rounded p-3 font-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}

            {/* Yeast spans both columns to balance the grid */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-label-sm text-on-surface-variant">YEAST STRAIN</label>
              <input
                type="text"
                value={yeast}
                onChange={(e) => setYeast(e.target.value)}
                placeholder="e.g., Lalvin 71B, D47..."
                className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: Formulation Calculator --- */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-6 border-b border-surface-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="font-headline-md text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calculate</span>
                Formulation
              </h3>

              <div className="flex bg-surface-container border border-outline-variant rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setCalcMode('ingredients')}
                  className={`px-4 py-2 text-sm font-label-sm uppercase tracking-widest rounded-md transition-all ${
                    calcMode === 'ingredients'
                      ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  By Ingredients
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('target_abv')}
                  className={`px-4 py-2 text-sm font-label-sm uppercase tracking-widest rounded-md transition-all ${
                    calcMode === 'target_abv'
                      ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  By Target ABV
                </button>
              </div>
            </div>

            <div className="mb-6 w-full md:w-1/2 pr-0 md:pr-3">
              <label className="font-label-sm text-on-surface-variant">
                TOTAL TARGET VOLUME (GALLONS)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={volumeGal}
                onChange={(e) => setVolumeGal(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mt-1"
                required
              />
            </div>

            <div className="p-5 bg-surface-container-lowest border border-outline-variant rounded-lg">
              {calcMode === 'ingredients' ? (
                <div>
                  <label className="font-label-sm text-on-surface-variant">
                    HONEY AMOUNT (LBS)
                  </label>
                  <p className="text-sm text-on-surface-variant mb-2">
                    Water/fluid will make up the remaining volume to reach {volumeGal} gallons.
                  </p>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={honeyLbs}
                    onChange={(e) => setHoneyLbs(parseFloat(e.target.value) || 0)}
                    className="w-full md:w-1/2 bg-surface-container border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-label-sm text-on-surface-variant">
                    DESIRED TARGET ABV (%)
                  </label>
                  <p className="text-sm text-on-surface-variant mb-2">
                    Calculates honey needed, assuming fermentation runs perfectly dry (1.000 FG).
                  </p>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={targetAbv}
                    onChange={(e) => setTargetAbv(parseFloat(e.target.value) || 0)}
                    className="w-full md:w-1/2 bg-surface-container border border-outline-variant rounded p-3 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-container-high p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {calcMode === 'ingredients' ? (
              <>
                <div className="flex gap-8 w-full md:w-auto">
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">ESTIMATED OG</p>
                    <p className="font-metric-xl text-3xl text-primary">{estOg}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">POTENTIAL ABV</p>
                    <p className="font-metric-xl text-3xl text-primary">{estAbv}%</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant md:max-w-xs leading-relaxed">
                  Calculations assume average honey (35 PPG) and a completely dry fermentation
                  finishing at 1.000 FG.
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-8 w-full md:w-auto items-center">
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">REQUIRED HONEY</p>
                    <p className="font-metric-xl text-3xl text-primary">
                      {requiredHoneyLbs}{' '}
                      <span className="text-lg font-body-md text-on-surface-variant">lbs</span>
                    </p>
                  </div>
                </div>
                <div className="text-sm md:max-w-sm leading-relaxed bg-tertiary-container/30 border border-tertiary/20 p-3 rounded text-on-surface-variant flex gap-3">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">info</span>
                  <p>
                    <strong>Precision Tip:</strong> Honey density varies. Add ~90% of this amount,
                    mix thoroughly, and take a hydrometer reading. Slowly add the remaining honey to
                    hit exactly <strong>{estOg}</strong> target OG.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex justify-end gap-4 mt-4 border-t border-surface-container pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-outline text-on-surface font-label-sm uppercase tracking-widest rounded hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-on-primary font-label-sm uppercase tracking-widest rounded hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">water_drop</span>
            Start Fermentation
          </button>
        </div>
      </form>
    </div>
  )
}
