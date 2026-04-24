// src/components/dashboard/MetricCard.jsx
export default function MetricCard({ title, icon, value, unit, iconColor }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="font-label-sm text-xs font-semibold tracking-widest uppercase text-on-surface-variant">{title}</span>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <span className="font-metric-xl text-5xl font-bold text-on-surface">{value}</span>
        <span className="font-body-md text-on-surface-variant ml-1">{unit}</span>
      </div>
    </div>
  );
}