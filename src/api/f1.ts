import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
  QualifyingResponse,
  Race,
  RaceResult,
  RaceResultsResponse,
  ScheduleResponse,
  SeasonsResponse,
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

let seasonsListPromise: Promise<string[]> | null = null

/** All F1 seasons the API has data for, ascending (e.g. "1950" .. "2026"). Fetched once and cached. */
export function getSeasonsList(): Promise<string[]> {
  if (!seasonsListPromise) {
    seasonsListPromise = getJSON<SeasonsResponse>('/seasons.json?limit=100')
      .then((data) => data.SeasonTable.Seasons.map((s) => s.season))
      .catch((err) => {
        seasonsListPromise = null
        throw err
      })
  }
  return seasonsListPromise
}

export function getRaceResults(season: Season, round: number | 'last') {
  return getJSON<RaceResultsResponse>(`/${season}/${round}/results.json`)
}

export function getQualifying(season: Season, round: number | 'last') {
  return getJSON<QualifyingResponse>(`/${season}/${round}/qualifying.json`)
}

export type RaceWithResults = Race & { Results: RaceResult[] }

const PAGE_SIZE = 100

interface PagedRaceResponse<K extends string> {
  total: string
  RaceTable: { Races: (Race & Record<K, RaceResult[]>)[] }
}

/**
 * Walks every page of a season-wide race endpoint (the API caps at 100 rows per
 * request) and merges the rows back into one entry per round.
 */
async function fetchAllRounds<K extends string>(path: string, key: K): Promise<RaceWithResults[]> {
  const races = new Map<string, RaceWithResults>()
  let offset = 0

  while (true) {
    const separator = path.includes('?') ? '&' : '?'
    const page = await getJSON<PagedRaceResponse<K>>(
      `${path}${separator}limit=${PAGE_SIZE}&offset=${offset}`,
    )
    for (const race of page.RaceTable.Races) {
      const rows = race[key] ?? []
      const existing = races.get(race.round)
      if (existing) {
        existing.Results.push(...rows)
      } else {
        races.set(race.round, { ...race, Results: [...rows] })
      }
    }
    offset += PAGE_SIZE
    if (offset >= Number(page.total)) break
  }

  return Array.from(races.values()).sort((a, b) => Number(a.round) - Number(b.round))
}

function cachedBySeason<T>(cache: Map<Season, Promise<T>>, season: Season, load: () => Promise<T>) {
  const cached = cache.get(season)
  if (cached) return cached

  const promise = load()
  cache.set(season, promise)
  promise.catch(() => cache.delete(season))
  return promise
}

const seasonResultsCache = new Map<Season, Promise<RaceWithResults[]>>()
const seasonSprintCache = new Map<Season, Promise<RaceWithResults[]>>()

/** Every grand prix result for a season, one entry per round. Cached per season. */
export function getSeasonResults(season: Season = 'current'): Promise<RaceWithResults[]> {
  return cachedBySeason(seasonResultsCache, season, () =>
    fetchAllRounds(`/${season}/results.json`, 'Results'),
  )
}

/**
 * Every sprint result for a season. Sprint points are awarded separately from
 * the grand prix, so championship totals need both this and `getSeasonResults`.
 */
export function getSeasonSprintResults(season: Season = 'current'): Promise<RaceWithResults[]> {
  return cachedBySeason(seasonSprintCache, season, () =>
    fetchAllRounds(`/${season}/sprint.json`, 'SprintResults').catch(() => []),
  )
}

/** Sprint points for a season, keyed by round then driverId. */
export async function getSprintPointsByRound(
  season: Season = 'current',
): Promise<Map<string, Map<string, number>>> {
  const sprints = await getSeasonSprintResults(season)
  const byRound = new Map<string, Map<string, number>>()

  for (const race of sprints) {
    const perDriver = new Map<string, number>()
    for (const result of race.Results) {
      perDriver.set(result.Driver.driverId, Number(result.points))
    }
    byRound.set(race.round, perDriver)
  }

  return byRound
}
