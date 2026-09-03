import type { RaceWithResults } from '../api/f1'

export interface DriverReliability {
  driverId: string
  name: string
  code: string
  constructorId: string
  starts: number
  finishes: number
  dnfs: number
  finishRate: number
  causes: Record<string, number>
}

/** "Finished" and lapped-but-classified results count as a finish; everything else is a DNF. */
const isClassified = (status: string) => status === 'Finished' || /^\+\d+ Laps?$/.test(status)

export function buildReliability(races: RaceWithResults[]) {
  const byDriver = new Map<string, DriverReliability>()

  for (const race of races) {
    for (const r of race.Results) {
      const id = r.Driver.driverId
      const entry = byDriver.get(id) ?? {
        driverId: id,
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        code: r.Driver.code ?? r.Driver.familyName,
        constructorId: r.Constructor.constructorId,
        starts: 0,
        finishes: 0,
        dnfs: 0,
        finishRate: 0,
        causes: {},
      }
      entry.constructorId = r.Constructor.constructorId
      entry.starts += 1
      if (isClassified(r.status)) {
        entry.finishes += 1
      } else {
        entry.dnfs += 1
        entry.causes[r.status] = (entry.causes[r.status] ?? 0) + 1
      }
      byDriver.set(id, entry)
    }
  }

  const drivers = Array.from(byDriver.values())
    .map((d) => ({ ...d, finishRate: d.starts > 0 ? Math.round((d.finishes / d.starts) * 1000) / 10 : 0 }))
    .sort((a, b) => b.finishRate - a.finishRate || b.starts - a.starts)

  const causeCounts = new Map<string, number>()
  for (const d of drivers) {
    for (const [cause, count] of Object.entries(d.causes)) {
      causeCounts.set(cause, (causeCounts.get(cause) ?? 0) + count)
    }
  }
  const causes = Array.from(causeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cause, count]) => ({ cause, count }))

  return { drivers, causes }
}
