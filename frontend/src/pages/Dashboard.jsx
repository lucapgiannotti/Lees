// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/dashboard/MetricCard'
import BatchCard from '../components/dashboard/BatchCard'

export default function Dashboard() {
  const [batches, setBatches] = useState([])
  const [metrics, setMetrics] = useState({
    total_active_gallons: 0,
    avg_fermentation_temp: 0,
    inventory_alerts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard metrics and active batches simultaneously
    Promise.all([
      fetch('http://localhost:8000/api/dashboard/metrics').then((res) => res.json()),
      fetch('http://localhost:8000/api/batches?status=ACTIVE').then((res) => res.json()),
    ])
      .then(([metricsData, batchesData]) => {
        setMetrics(metricsData)

        // Map the raw database data into the shape your BatchCard expects
        const mappedBatches = batchesData.map((batch) => {
          // Grab the most recent reading for the display
          const latestLog =
            batch.logs && batch.logs.length > 0 ? batch.logs[batch.logs.length - 1] : null

          // Calculate days active
          const start = new Date(batch.start_date)
          const now = new Date()
          const daysActive = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))

          // Determine colors and estimated timelines based on phase
          let phaseColor = 'bg-surface-container-highest text-on-surface'
          let progressColor = 'bg-primary'
          let totalDays = 14 // Default estimate

          if (batch.phase?.includes('Primary')) {
            phaseColor = 'bg-primary-container text-on-primary-container'
            progressColor = 'bg-primary'
            totalDays = 14
          } else if (batch.phase?.includes('Secondary')) {
            phaseColor = 'bg-secondary-container text-on-secondary-container'
            progressColor = 'bg-secondary'
            totalDays = 30
          }

          const progress = Math.min(100, (daysActive / totalDays) * 100)

          return {
            id: batch.id,
            name: batch.name,
            phase: batch.phase || 'Primary',
            phaseColor,
            currentSg: latestLog?.sg || '--',
            temp: latestLog?.temp ? `${latestLog.temp}°F` : '--',
            currentDay: daysActive,
            totalDays,
            progress,
            progressColor,

            // NEW: Pass formulation data down to the BatchCard
            style: batch.style,
            recipe: batch.recipe,
            honey_varietal: batch.honey_varietal,
            yeast: batch.yeast,
            nutrient_protocol: batch.nutrient_protocol,
          }
        })

        setBatches(mappedBatches)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-on-surface-variant">
        Loading command center...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Overview of your active operations.
          </p>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest bg-surface-container px-3 py-1 rounded-full w-fit">
          Last updated: Just now
        </p>
      </header>

      {/* Quick Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard
          title="TOTAL ACTIVE GALLONS"
          icon="water_drop"
          value={metrics.total_active_gallons}
          unit="gal"
          iconColor="text-primary"
        />
        <MetricCard
          title="AVG FERMENTATION TEMP"
          icon="thermostat"
          value={metrics.avg_fermentation_temp}
          unit="°F"
          iconColor="text-secondary"
        />
        <MetricCard
          title="INVENTORY ALERTS"
          icon="warning"
          value={metrics.inventory_alerts}
          unit="low stock items"
          iconColor="text-error"
        />
      </section>

      {/* Active Fermentations Section */}
      <section>
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Active Fermentations
          </h3>
          <Link
            to="/batches"
            className="font-label-sm text-label-sm text-primary hover:underline uppercase tracking-widest"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {batches.length > 0 ? (
            batches.map((batch) => <BatchCard key={batch.id} batch={batch} />)
          ) : (
            <div className="col-span-2 p-8 bg-surface-container-lowest border border-outline-variant rounded-xl text-center text-on-surface-variant font-body-md">
              No active batches. Time to start brewing!
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
