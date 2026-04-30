export const calculateMeasuredAbv = (batch) => {
  const logs = batch.logs || []
  if (logs.length === 0) return '0.0'

  const readingsBeforeHoney = []
  let honeyWasAdded = false
  logs.forEach((log) => {
    if (log.added_honey_g > 0) honeyWasAdded = true
    if (!honeyWasAdded && log.sg != null) readingsBeforeHoney.push(log.sg)
  })

  const og = readingsBeforeHoney[0] || batch.target_og || 1.0
  const terminalFg = readingsBeforeHoney.length > 0 ? Math.min(...readingsBeforeHoney) : og
  const peakAbv = (og - terminalFg) * 131.25

  const totalHoneyG = logs.reduce((sum, l) => sum + (l.added_honey_g || 0), 0)
  const honeyVolGal = (totalHoneyG / 453.592) * 0.085
  const baseVol = batch.volume_gal || 1.0

  const dilutedAbv = (peakAbv * baseVol) / (baseVol + honeyVolGal)
  return Math.max(0, dilutedAbv).toFixed(1)
}

export const getPhaseColor = (phase) => {
  if (phase?.includes('Primary')) return 'bg-primary-container text-on-primary-container'
  if (phase?.includes('Secondary')) return 'bg-secondary-container text-on-secondary-container'
  return 'bg-surface-container-highest text-on-surface'
}

export const getDaysActive = (startDate) => {
  if (!startDate) return 0
  const start = new Date(startDate)
  const now = new Date()
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

export const calculateSweetness = (sg) => {
  if (sg == null) return 'Unknown'
  if (sg < 1.0) return 'Bone Dry'
  if (sg >= 1.0 && sg < 1.006) return 'Dry'
  if (sg >= 1.006 && sg < 1.015) return 'Semi-Sweet'
  if (sg >= 1.015 && sg < 1.025) return 'Sweet'
  if (sg >= 1.025) return 'Dessert / Sack'
  return 'Unknown'
}
