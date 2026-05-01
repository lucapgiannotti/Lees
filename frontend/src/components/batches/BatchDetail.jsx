import React, { useState } from 'react'
import { calculateMeasuredAbv, getPhaseColor } from '../../utils/fermentationMath'

export default function BatchDetail({
  batch,
  onBack,
  onUpdatePhase,
  onAddLog,
  onDeleteLog,
  onEditLog,
  onOpenEdit,
  onUpdateBottles,
}) {
  const [logType, setLogType] = useState('reading')
  const [logSg, setLogSg] = useState('')
  const [logTemp, setLogTemp] = useState('')
  const [logNote, setLogNote] = useState('')
  const [logHoney, setLogHoney] = useState('')
  const [logRating, setLogRating] = useState('5 - Excellent')

  const [editingLogId, setEditingLogId] = useState(null)
  const [editLogData, setEditLogData] = useState({})

  const isBottled = batch.status === 'BOTTLED' || batch.status === 'ARCHIVED'
  const logs = batch.logs || []
  const currentSg =
    logs
      .slice()
      .reverse()
      .find((l) => l.sg != null)?.sg || '--'
  const measuredAbv = calculateMeasuredAbv(batch)
  const showMeasuredAbv = batch.phase !== 'Primary' && !isBottled

  const handleSubmitLog = (e) => {
    e.preventDefault()
    onAddLog({
      type: logType,
      sg: logSg,
      temp: logTemp,
      note: logNote,
      honey: logHoney,
      rating: logRating,
    })
    setLogSg('')
    setLogTemp('')
    setLogNote('')
    setLogHoney('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 relative">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-label-sm uppercase tracking-widest"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Batches
      </button>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-0.5 font-label-sm text-xs rounded ${getPhaseColor(batch.phase)}`}
            >
              {batch.phase || 'Unknown Phase'}
            </span>
            <span className="font-label-sm text-on-surface-variant">Batch #{batch.id}</span>
          </div>
          <h1 className="font-headline-lg text-4xl">{batch.name}</h1>

          <div className="flex flex-col gap-1 mt-2">
            <p className="text-on-surface-variant font-medium">{batch.recipe || batch.style}</p>
            {(batch.honey_varietal || batch.yeast) && (
              <p className="text-sm text-on-surface-variant/80 flex items-center gap-2">
                {batch.honey_varietal && <span>{batch.honey_varietal}</span>}
                {batch.honey_varietal && batch.yeast && <span>•</span>}
                {batch.yeast && <span>{batch.yeast}</span>}
              </p>
            )}
            {batch.nutrient_protocol && (
              <p className="text-sm text-on-surface-variant/80 flex items-center gap-2">
                <span>{batch.nutrient_protocol}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={onOpenEdit}
            className="bg-surface-container-lowest border border-outline text-on-surface px-4 py-2 rounded font-label-sm uppercase hover:bg-surface-container transition-colors"
          >
            Edit
          </button>
          <div className="relative flex items-center">
            <select
              value={batch.phase || 'Primary'}
              onChange={(e) => onUpdatePhase(e.target.value)}
              className="appearance-none bg-primary text-on-primary px-4 py-2 pr-10 rounded font-label-sm uppercase tracking-widest hover:opacity-90 cursor-pointer border border-transparent focus:outline-none"
            >
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Bulk Aging">Bulk Aging</option>
              <option value="Bottled">Bottled</option>
              <option value="Archived">Archived</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 text-on-primary pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h2 className="font-headline-md text-xl border-b border-surface-container pb-3 mb-4">
              {isBottled ? 'Cellar Status' : 'Current Status'}
            </h2>
            <div
              className={`grid ${isBottled ? 'grid-cols-2' : showMeasuredAbv ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}
            >
              {isBottled ? (
                <>
                  <div className="flex flex-col">
                    <p className="font-label-sm text-on-surface-variant mb-1 uppercase text-[10px]">
                      Remaining
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          onUpdateBottles &&
                          onUpdateBottles(Math.max(0, batch.remaining_bottles - 1))
                        }
                        className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        disabled={batch.remaining_bottles <= 0}
                      >
                        <span className="material-symbols-outlined text-[20px]">remove</span>
                      </button>
                      <p className="font-metric-xl text-3xl min-w-[2rem] text-center">
                        {batch.remaining_bottles}
                      </p>
                      <button
                        onClick={() =>
                          onUpdateBottles && onUpdateBottles(batch.remaining_bottles + 1)
                        }
                        className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    </div>
                    <p className="text-on-surface-variant font-body-md mt-1">
                      out of {batch.yield_bottles} total
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-label-sm text-primary mb-1 uppercase text-[10px]">
                      Final ABV
                    </p>
                    <p className="font-metric-xl text-3xl text-primary">{measuredAbv}%</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 italic">
                      Target: {batch.target_abv || '--'}%
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1 uppercase text-[10px]">
                      Current SG
                    </p>
                    <p className="font-metric-xl text-3xl">{currentSg}</p>
                  </div>
                  {showMeasuredAbv && (
                    <div>
                      <p className="font-label-sm text-primary mb-1 uppercase text-[10px]">
                        Measured ABV
                      </p>
                      <p className="font-metric-xl text-3xl text-primary">{measuredAbv}%</p>
                    </div>
                  )}
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1 uppercase text-[10px]">
                      Target ABV
                    </p>
                    <p className="font-metric-xl text-3xl">{batch.target_abv || '--'}%</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
            <h2 className="font-headline-md text-xl mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {isBottled ? 'wine_bar' : 'edit_document'}
              </span>
              {isBottled ? 'Log Tasting' : 'Update Log'}
            </h2>
            <form onSubmit={handleSubmitLog} className="flex flex-col gap-4">
              {isBottled ? (
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                    Rating (1-5)
                  </label>
                  <select
                    value={logRating}
                    onChange={(e) => setLogRating(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-body-md focus:outline-none"
                  >
                    <option>5 - Excellent</option>
                    <option>4 - Very Good</option>
                    <option>3 - Good / Needs Time</option>
                    <option>2 - Flawed</option>
                    <option>1 - Dump It</option>
                  </select>
                </div>
              ) : (
                <div className="flex bg-surface-container border border-outline-variant rounded-lg p-1 w-full mb-2">
                  <button
                    type="button"
                    onClick={() => setLogType('reading')}
                    className={`flex-1 py-1.5 text-xs font-label-sm uppercase tracking-widest rounded-md transition-all ${logType === 'reading' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
                  >
                    Reading
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogType('addition')}
                    className={`flex-1 py-1.5 text-xs font-label-sm uppercase tracking-widest rounded-md transition-all ${logType === 'addition' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
                  >
                    Addition
                  </button>
                </div>
              )}
              {logType === 'reading' && !isBottled ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-end gap-1">
                    <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                      SG
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={logSg}
                      onChange={(e) => setLogSg(e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded p-3"
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-1">
                    <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                      Temp
                    </label>
                    <input
                      type="number"
                      value={logTemp}
                      onChange={(e) => setLogTemp(e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded p-3"
                    />
                  </div>
                </div>
              ) : (
                !isBottled && (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-tertiary uppercase text-[10px]">
                      Honey (g)
                    </label>
                    <input
                      type="number"
                      value={logHoney}
                      onChange={(e) => setLogHoney(e.target.value)}
                      className="bg-surface-container-lowest border border-tertiary/50 rounded p-3"
                      required
                    />
                  </div>
                )
              )}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded p-3 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-surface-container-highest border border-outline text-on-surface font-label-sm uppercase tracking-widest py-3 rounded mt-2"
              >
                {isBottled ? 'Save Tasting' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-6 border-b border-surface-container">
              <h2 className="font-headline-md text-xl">
                {isBottled ? 'Tasting History' : 'Fermentation Log'}
              </h2>
            </div>
            <div className="divide-y divide-surface-container">
              {logs
                .slice()
                .reverse()
                .map((log) => {
                  const isEditing = editingLogId === log.id

                  if (isEditing) {
                    return (
                      <div
                        key={log.id}
                        className="p-6 bg-surface-container-low transition-colors group"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-label-sm uppercase tracking-widest text-primary">
                              Edit Log
                            </h4>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this log?')) {
                                  onDeleteLog && onDeleteLog(log.id)
                                  setEditingLogId(null)
                                }
                              }}
                              className="text-error font-label-sm uppercase hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                                Date
                              </label>
                              <input
                                type="datetime-local"
                                value={
                                  editLogData.date
                                    ? new Date(
                                        new Date(editLogData.date).getTime() -
                                          new Date().getTimezoneOffset() * 60000
                                      )
                                        .toISOString()
                                        .slice(0, 16)
                                    : ''
                                }
                                onChange={(e) =>
                                  setEditLogData({
                                    ...editLogData,
                                    date: new Date(e.target.value).toISOString(),
                                  })
                                }
                                className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                                SG
                              </label>
                              <input
                                type="number"
                                step="0.001"
                                value={editLogData.sg || ''}
                                onChange={(e) =>
                                  setEditLogData({
                                    ...editLogData,
                                    sg: e.target.value ? parseFloat(e.target.value) : null,
                                  })
                                }
                                className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                                Temp (°F)
                              </label>
                              <input
                                type="number"
                                value={editLogData.temp || ''}
                                onChange={(e) =>
                                  setEditLogData({
                                    ...editLogData,
                                    temp: e.target.value ? parseFloat(e.target.value) : null,
                                  })
                                }
                                className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                                Honey (g)
                              </label>
                              <input
                                type="number"
                                value={editLogData.added_honey_g || ''}
                                onChange={(e) =>
                                  setEditLogData({
                                    ...editLogData,
                                    added_honey_g: e.target.value
                                      ? parseFloat(e.target.value)
                                      : null,
                                  })
                                }
                                className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                              Notes
                            </label>
                            <textarea
                              rows="2"
                              value={editLogData.note || ''}
                              onChange={(e) =>
                                setEditLogData({ ...editLogData, note: e.target.value })
                              }
                              className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm resize-none"
                            />
                          </div>
                          {isBottled && (
                            <div className="flex flex-col gap-1">
                              <label className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                                Rating (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={editLogData.rating || ''}
                                onChange={(e) =>
                                  setEditLogData({
                                    ...editLogData,
                                    rating: e.target.value ? parseInt(e.target.value) : null,
                                  })
                                }
                                className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm max-w-[100px]"
                              />
                            </div>
                          )}
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              onClick={() => setEditingLogId(null)}
                              className="px-4 py-2 border border-outline rounded font-label-sm uppercase text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                onEditLog && onEditLog(log.id, editLogData)
                                setEditingLogId(null)
                              }}
                              className="px-4 py-2 bg-primary text-on-primary rounded font-label-sm uppercase text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={log.id}
                      className="p-6 hover:bg-surface-container-low transition-colors group relative"
                    >
                      <button
                        onClick={() => {
                          setEditingLogId(log.id)
                          setEditLogData({ ...log })
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-primary transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <div className="flex flex-wrap items-center gap-3 pr-8">
                        <span className="font-label-sm text-on-surface-variant w-24">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {log.sg && (
                          <span className="font-body-md font-bold text-lg bg-surface-container-high px-2 rounded">
                            {log.sg}
                          </span>
                        )}
                        {log.added_honey_g && (
                          <span className="font-label-sm text-tertiary border border-tertiary px-2 py-0.5 rounded bg-tertiary/10">
                            +{log.added_honey_g}g Honey
                          </span>
                        )}
                        {log.rating && (
                          <span className="font-label-sm text-primary border border-primary px-2 py-0.5 rounded bg-primary/10">
                            Score: {log.rating}/5
                          </span>
                        )}
                        {log.temp && (
                          <span className="font-body-md text-on-surface-variant flex items-center gap-1">
                            {log.temp}°F
                          </span>
                        )}
                      </div>
                      {log.note && (
                        <p className="text-on-surface-variant pl-28 mt-2 text-sm pr-8">
                          {log.note}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
