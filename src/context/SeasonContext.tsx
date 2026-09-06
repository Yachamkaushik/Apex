import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSeasonsList, type Season } from '../api/f1'

const STORAGE_KEY = 'apex:season'

/**
 * Earliest season the selector offers. Scoped to the "modern era" rather
 * than the full 1950+ history the API has: this is also the first season
 * with full pit-stop timing and fastest-lap data, so every page — not just
 * standings/results — actually has something to show for every season on
 * the list.
 */
const MIN_SEASON = 2011

export interface SeasonOption {
  value: Season
  label: string
}

interface SeasonContextValue {
  season: Season
  setSeason: (season: Season) => void
  /** All selectable seasons, newest first — "Current" pinned at the top. */
  options: SeasonOption[]
  isCurrent: boolean
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

function readStoredSeason(): Season {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw || raw === 'current') return 'current'
    const year = Number(raw)
    // A season saved before the modern-era cutoff was introduced (or a
    // stale/corrupt value) falls back to 'current' rather than a range
    // the app no longer offers.
    return Number.isFinite(year) && year >= MIN_SEASON ? year : 'current'
  } catch {
    return 'current'
  }
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>(readStoredSeason)
  const [years, setYears] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    getSeasonsList()
      .then((list) => {
        if (!cancelled) setYears(list.filter((y) => Number(y) >= MIN_SEASON))
      })
      .catch(() => {
        // Selector just won't offer historical years — the "current" default still works.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setSeason = (next: Season) => {
    setSeasonState(next)
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // Non-fatal — the pick just won't persist across reloads.
    }
  }

  const options = useMemo<SeasonOption[]>(() => {
    if (years.length === 0) return [{ value: 'current', label: 'Current season' }]
    const latest = years[years.length - 1]
    const historical = years
      .slice(0, -1)
      .reverse()
      .map((y) => ({ value: Number(y), label: y }))
    return [{ value: 'current', label: `${latest} (current)` }, ...historical]
  }, [years])

  const value: SeasonContextValue = { season, setSeason, options, isCurrent: season === 'current' }

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}

export function useSeason(): SeasonContextValue {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within a SeasonProvider')
  return ctx
}
