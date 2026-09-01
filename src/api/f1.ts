import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
  Race,
  RaceResult,
  RaceResultsResponse,
  ScheduleResponse,
} from '../types/f1'

const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`F1 API request failed: ${res.status} ${res.statusText} (${path})`)
  }
  const json = await res.json()
  return json.MRData as T
}

/** Season identifier: a 4-digit year, or "current" for the active season. */
export type Season = number | 'current'

export function getDriverStandings(season: Season = 'current') {
  return getJSON<DriverStandingsResponse>(`/${season}/driverStandings.json`)
}

export function getConstructorStandings(season: Season = 'current') {
  return getJSON<ConstructorStandingsResponse>(`/${season}/constructorStandings.json`)
}

export function getSchedule(season: Season = 'current') {
  return getJSON<ScheduleResponse>(`/${season}.json?limit=40`)
}

export function getRaceResults(season: Season, round: number | 'last') {
  return getJSON<RaceResultsResponse>(`/${season}/${round}/results.json`)
}

export type RaceWithResults = Race & { Results: RaceResult[] }

const PAGE_SIZE = 100
const seasonResultsCache = new Map<Season, Promise<RaceWithResults[]>>()

/**
 * Fetches every race result for a season (paginated under the hood — the API
 * caps at 100 rows per request) and merges them into one race-by-race list.
 * Results are cached per season for the lifetime of the page.
 */
export function getSeasonResults(season: Season = 'current'): Promise<RaceWithResults[]> {
  const cached = seasonResultsCache.get(season)
  if (cached) return cached

  const promise = (async () => {
    const races = new Map<string, RaceWithResults>()
    let offset = 0

    while (true) {
      const page = await getJSON<RaceResultsResponse>(
        `/${season}/results.json?limit=${PAGE_SIZE}&offset=${offset}`,
      )
      for (const race of page.RaceTable.Races) {
        const existing = races.get(race.round)
        if (existing) {
          existing.Results.push(...race.Results)
        } else {
          races.set(race.round, race)
        }
      }
      offset += PAGE_SIZE
      if (offset >= Number(page.total)) break
    }

    return Array.from(races.values()).sort((a, b) => Number(a.round) - Number(b.round))
  })()

  seasonResultsCache.set(season, promise)
  promise.catch(() => seasonResultsCache.delete(season))
  return promise
}
