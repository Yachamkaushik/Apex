import type { RaceWithResults } from '../api/f1'
import { parseLapTime } from './lapTime'

export interface PaceMeta {
  code: string
  name: string
  constructorId: string
}

export interface PaceRow {
  round: number
  raceName: string
  [driverId: string]: number | string
}

export interface PaceGapTrend {
  rows: PaceRow[]
  driverIds: string[]
  driverMeta: Record<string, PaceMeta>
}

/**
 * For each round, every driver's fastest-lap gap to that race's outright
 * fastest lap (0 = quickest that day). Normalizes across circuits of very
 * different lengths, so the trend actually reflects relative pace rather
 * than track length. `topN` picks the drivers with the best average gap
 * among those who raced at least half the rounds with data.
 */
export function buildPaceGapTrend(races: RaceWithResults[], topN = 6): PaceGapTrend {
  const rows: PaceRow[] = []
  const driverMeta: Record<string, PaceMeta> = {}
  const gapSums: Record<string, number> = {}
  const gapCounts: Record<string, number> = {}

  for (const race of races) {
    const laps = race.Results.flatMap((r) => {
      const seconds = parseLapTime(r.FastestLap?.Time.time)
      return seconds === null ? [] : [{ id: r.Driver.driverId, seconds, result: r }]
    })
    if (laps.length === 0) continue

    const fastest = Math.min(...laps.map((l) => l.seconds))
    const row: PaceRow = { round: Number(race.round), raceName: race.raceName }
    for (const { id, seconds, result } of laps) {
      const gap = Math.round((seconds - fastest) * 1000) / 1000
      row[id] = gap
      gapSums[id] = (gapSums[id] ?? 0) + gap
      gapCounts[id] = (gapCounts[id] ?? 0) + 1
      driverMeta[id] = {
        code: result.Driver.code ?? result.Driver.familyName,
        name: `${result.Driver.givenName} ${result.Driver.familyName}`,
        constructorId: result.Constructor.constructorId,
      }
    }
    rows.push(row)
  }

  const minAppearances = Math.max(2, Math.floor(rows.length * 0.5))
  const driverIds = Object.keys(gapSums)
    .filter((id) => gapCounts[id] >= minAppearances)
    .sort((a, b) => gapSums[a] / gapCounts[a] - gapSums[b] / gapCounts[b])
    .slice(0, topN)

  return { rows, driverIds, driverMeta }
}

export interface FastestLapEntry {
  round: number
  raceName: string
  driverId: string
  name: string
  code: string
  constructorId: string
  seconds: number
}

/** The outright fastest lap of each round, for a season leaderboard. */
export function buildFastestLapByRound(races: RaceWithResults[]): FastestLapEntry[] {
  return races.flatMap((race) => {
    let best: FastestLapEntry | null = null
    for (const r of race.Results) {
      const seconds = parseLapTime(r.FastestLap?.Time.time)
      if (seconds === null) continue
      if (!best || seconds < best.seconds) {
        best = {
          round: Number(race.round),
          raceName: race.raceName,
          driverId: r.Driver.driverId,
          name: `${r.Driver.givenName} ${r.Driver.familyName}`,
          code: r.Driver.code ?? r.Driver.familyName,
          constructorId: r.Constructor.constructorId,
          seconds,
        }
      }
    }
    return best ? [best] : []
  })
}
