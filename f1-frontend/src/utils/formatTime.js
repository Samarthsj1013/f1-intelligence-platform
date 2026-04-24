export function formatLapTime(seconds) {
  if (!seconds || isNaN(seconds)) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${mins}:${secs}`
}