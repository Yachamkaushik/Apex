import type { RaceWithResults } from '../api/f1'

export interface DriverMeta {
  code: string
  name: string
  constructorId: string
}

export interface ProgressionRow {
  round: number
  raceName: string
  [driverId: string]: number | string
}

export interface PointsProgression {
  rows: ProgressionRow[]
  driverIds: string[]
  driverMeta: Record<string, DriverMeta>
}

/**
 * Turns a season's race-by-race results into cumulative points per driver,
 * one row per round. `topN` limits which drivers are returned (ranked by
 * final points) so a chart doesn't have to plot the whole grid.
 *
 * `sprintPoints` (round → driverId → points) is folded in so totals match the
 * official standings — the results endpoint covers grands prix only.
 */
export function buildPointsProgression(
  races: RaceWithResults[],
  topN = 6,
  sprintPoints?: Map<string, Map<string, number>>,
): PointsProgression {
  const totals: Record<string, number> = {}
  const driverMeta: Record<string, DriverMeta> = {}
  const rows: ProgressionRow[] = []

  for (const race of races) {
    const sprintForRound = sprintPoints?.get(race.round)

    for (const result of race.Results) {
      const id = result.Driver.driverId
      totals[id] = (totals[id] ?? 0) + Number(result.points) + (sprintForRound?.get(id) ?? 0)
      driverMeta[id] = {
        code: result.Driver.code ?? result.Driver.familyName,
        name: `${result.Driver.givenName} ${result.Driver.familyName}`,
        constructorId: result.Constructor.constructorId,
      }
    }

    const row: ProgressionRow = { round: Number(race.round), raceName: race.raceName }
    for (const id of Object.keys(totals)) {
      row[id] = totals[id]
    }
    rows.push(row)
  }

  const driverIds = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([id]) => id)

  return { rows, driverIds, driverMeta }
}
