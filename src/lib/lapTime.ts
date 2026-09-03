/** Parses an F1-style time string ("1:18.518" or "18.518") into seconds. */
export function parseLapTime(time: string | undefined): number | null {
  if (!time) return null
  const parts = time.split(':')
  if (parts.length === 2) {
    const minutes = Number(parts[0])
    const seconds = Number(parts[1])
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
    return minutes * 60 + seconds
  }
  const seconds = Number(time)
  return Number.isFinite(seconds) ? seconds : null
}

export function formatSeconds(seconds: number): string {
  if (seconds < 60) return seconds.toFixed(3)
  const minutes = Math.floor(seconds / 60)
  const rest = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${minutes}:${rest}`
}
