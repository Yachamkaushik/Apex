import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
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
