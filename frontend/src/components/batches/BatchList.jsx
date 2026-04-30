import React from 'react'
import { calculateMeasuredAbv, getPhaseColor, getDaysActive } from '../../utils/fermentationMath'

export default function BatchList({ batches, activeTab, onTabChange, onSelectBatch }) {
  const filteredBatches = batches.filter((batch) => batch.status === activeTab)

  return (
    <>
      <div className="flex gap-2 border-b border-outline-variant mb-6 no-scrollbar overflow-x-auto">
        {['ACTIVE', 'BULK AGING', 'BOTTLED', 'ARCHIVED'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-3 font-label-sm uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="divide-y divide-surface-container">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => {
              const latestLog = batch.logs?.length > 0 ? batch.logs[batch.logs.length - 1] : null
              const finalAbv = calculateMeasuredAbv(batch)
              return (
                <div
                  key={batch.id}
                  onClick={() => onSelectBatch(batch)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="col-span-1 font-label-sm text-on-surface-variant">
                    #{batch.id}
                  </div>

                  <div className="col-span-4">
                    <p className="font-headline-md text-lg text-on-surface group-hover:text-primary transition-colors">
                      {batch.name}
                    </p>
                    <p className="font-body-md text-sm text-on-surface-variant">
                      {batch.recipe || batch.style}
                    </p>
                    {(batch.honey_varietal || batch.yeast) && (
                      <p className="text-xs text-on-surface-variant/70 mt-0.5">
                        {batch.honey_varietal} {batch.honey_varietal && batch.yeast && ' | '}{' '}
                        {batch.yeast}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`px-2 py-0.5 font-label-sm text-[10px] rounded ${getPhaseColor(batch.phase)} whitespace-nowrap`}
                    >
                      {batch.phase || 'Primary'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {activeTab === 'BOTTLED' ? (
                      <span className="font-body-md font-medium text-on-surface">
                        {batch.remaining_bottles} bottles
                      </span>
                    ) : (
                      <>
                        <span className="font-body-md font-medium text-on-surface">
                          {latestLog?.sg || '--'}
                        </span>
                        <span className="text-on-surface-variant text-sm">
                          ({latestLog?.temp ? `${latestLog.temp}°F` : 'No temp'})
                        </span>
                      </>
                    )}
                  </div>
                  <div className="col-span-2 font-body-md text-on-surface-variant">
                    {activeTab === 'BOTTLED'
                      ? `${finalAbv}%`
                      : `Day ${getDaysActive(batch.start_date)}`}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-body-md">
              No batches found in this category.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
