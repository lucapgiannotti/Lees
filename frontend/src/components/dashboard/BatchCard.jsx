export default function BatchCard({ batch }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
      <div className="p-6 pb-4 border-b border-surface-container flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 font-label-sm text-label-sm rounded ${batch.phaseColor}`}>
              {batch.phase}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Batch #{batch.id}
            </span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-surface">{batch.name}</h4>
        </div>
        <button className="text-on-surface-variant hover:text-primary min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4 flex-1">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">CURRENT SG</p>
          <p className="font-body-lg text-body-lg text-on-surface font-medium">{batch.currentSg}</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">TEMP</p>
          <p className="font-body-lg text-body-lg text-on-surface font-medium">{batch.temp}</p>
        </div>
        <div className="col-span-2 mt-2">
          <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface-variant">
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
        <button className="flex-1 bg-surface-container-lowest border border-outline text-on-surface font-body-md text-body-md font-medium py-2 rounded-lg hover:bg-surface-container transition-colors min-h-[48px]">
          Log Reading
        </button>
      </div>
    </div>
  )
}
