export default function BatchCard({ batch }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
      <div className="p-6 pb-4 border-b border-surface-container flex justify-between items-start">
        <div className="w-full pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 font-label-sm text-[10px] uppercase tracking-widest rounded ${batch.phaseColor}`}
            >
              {batch.phase}
            </span>
            <span className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">
              Batch #{batch.id}
            </span>
          </div>
          <h4 className="font-headline-md text-xl text-on-surface mb-1">{batch.name}</h4>

          {/* NEW: Explicit Formulation Data */}
          <div className="flex flex-col gap-1">
            <p className="font-body-sm text-sm text-on-surface-variant font-medium">
              {batch.recipe || batch.style}
            </p>
            {(batch.honey_varietal || batch.yeast) && (
              <p className="text-xs text-on-surface-variant/80 flex items-center gap-1.5">
                {batch.honey_varietal && <span>{batch.honey_varietal}</span>}
                {batch.honey_varietal && batch.yeast && <span>•</span>}
                {batch.yeast && <span>{batch.yeast}</span>}
              </p>
            )}
            {batch.nutrient_protocol && (
              <p className="text-xs text-on-surface-variant/80 flex items-center gap-1.5">
                <span>{batch.nutrient_protocol}</span>
              </p>
            )}
          </div>
        </div>

        <button className="text-on-surface-variant hover:text-primary min-h-12 min-w-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -mt-2 -mr-2">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4 flex-1">
        <div>
          <p className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            CURRENT SG
          </p>
          <p className="font-metric-lg text-2xl text-on-surface font-medium">
            {batch.currentSg || '--'}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            TEMP
          </p>
          <p className="font-metric-lg text-2xl text-on-surface font-medium">
            {batch.temp ? `${batch.temp}°F` : '--'}
          </p>
        </div>

        <div className="col-span-2 mt-2">
          <div className="flex justify-between font-label-sm text-[10px] uppercase tracking-widest mb-1 text-on-surface-variant">
            <span>Time in Phase</span>
            <span>
              Day {batch.currentDay} of ~{batch.totalDays}
            </span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2">
            <div
              className={`${batch.progressColor} h-2 rounded-full`}
              style={{ width: `${batch.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low px-6 py-4 mt-auto border-t border-surface-container flex gap-3">
        <button className="flex-1 bg-surface-container-lowest border border-outline text-on-surface font-label-sm uppercase tracking-widest py-3 rounded-lg hover:bg-surface-container transition-colors min-h-12">
          Log Reading
        </button>
      </div>
    </div>
  )
}
