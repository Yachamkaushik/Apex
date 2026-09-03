import type { RaceWithResults } from '../api/f1'
import type { PitStop } from '../types/f1'

export interface TeamPitStopStats {
  constructorId: string
  name: string
  stops: number
  avgDuration: number
}

export interface FastestPitStop {
  driverId: string
  name: string
  constructorId: string
  round: string
  raceName: string
  duration: number
  lap: string
}

export function buildPitStopStats(races: RaceWithResults[], pitStopsByRound: Map<string, PitStop[]>) {
  const driverMeta = new Map<string, { name: string; constructorId: string; constructorName: string }>()
  for (const race of races) {
    for (const r of race.Results) {
      driverMeta.set(r.Driver.driverId, {
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        constructorId: r.Constructor.constructorId,
        constructorName: r.Constructor.name,
      })
    }
  }

  const byTeam = new Map<string, { name: string; totalDuration: number; count: number }>()
  const allStops: FastestPitStop[] = []

  for (const race of races) {
    const stops = pitStopsByRound.get(race.round)
    if (!stops) continue
    for (const stop of stops) {
      const duration = Number(stop.duration)
      if (!Number.isFinite(duration)) continue
      const meta = driverMeta.get(stop.driverId)
      const constructorId = meta?.constructorId ?? stop.driverId
      const constructorName = meta?.constructorName ?? stop.driverId

      const team = byTeam.get(constructorId) ?? { name: constructorName, totalDuration: 0, count: 0 }
      team.totalDuration += duration
      team.count += 1
      byTeam.set(constructorId, team)

      allStops.push({
        driverId: stop.driverId,
        name: meta?.name ?? stop.driverId,
        constructorId,
        round: race.round,
        raceName: race.raceName,
        duration,
        lap: stop.lap,
      })
    }
  }

  const teams: TeamPitStopStats[] = Array.from(byTeam.entries())
    .map(([constructorId, t]) => ({
      constructorId,
      name: t.name,
      stops: t.count,
      avgDuration: Math.round((t.totalDuration / t.count) * 1000) / 1000,
    }))
    .sort((a, b) => a.avgDuration - b.avgDuration)

  const fastest = [...allStops].sort((a, b) => a.duration - b.duration).slice(0, 10)

  return { teams, fastest }
}
