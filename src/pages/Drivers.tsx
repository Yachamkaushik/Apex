import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDriverStandings } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { useSeason } from '../context/SeasonContext'
import { useAsync } from '../hooks/useAsync'
import { getTeamColor } from '../lib/teamColors'

export function Drivers() {
  const { season } = useSeason()
  const drivers = useAsync(() => getDriverStandings(season), [season])
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState('all')

  const rows = drivers.data?.StandingsTable.StandingsLists[0]?.DriverStandings ?? []

  const teams = useMemo(() => {
    const seen = new Map<string, string>()
    for (const row of rows) {
      for (const c of row.Constructors) {
        seen.set(c.constructorId, c.name)
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesTeam = team === 'all' || row.Constructors.some((c) => c.constructorId === team)
      if (!matchesTeam) return false
      if (!q) return true
      const haystack = [
        row.Driver.givenName,
        row.Driver.familyName,
        row.Driver.code ?? '',
        row.Driver.nationality,
        ...row.Constructors.map((c) => c.name),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [rows, query, team])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Drivers</h1>
        {drivers.data && <span className="season-tag">{drivers.data.StandingsTable.season} season</span>}
      </div>

      <AsyncBoundary status={drivers.status} error={drivers.error}>
        <div className="filter-bar">
          <input
            type="search"
            className="filter-input"
            placeholder="Search drivers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search drivers"
          />
          <select
            className="filter-select"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            aria-label="Filter by team"
          >
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <span className="filter-count">
            {filtered.length} of {rows.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="status-block">No drivers match that search.</div>
        ) : (
          <div className="driver-grid">
            {filtered.map((row) => {
              const teamColor = getTeamColor(row.Constructors[0]?.constructorId ?? '')
              return (
                <Link
                  to={`/drivers/${row.Driver.driverId}`}
                  className="driver-card"
                  key={row.Driver.driverId}
                  style={{ borderLeftColor: teamColor }}
                >
                  <div className="driver-card-number" style={{ color: teamColor }}>
                    {row.Driver.permanentNumber ?? '—'}
                  </div>
                  <div>
                    <h3>
                      {row.Driver.givenName} {row.Driver.familyName}
                    </h3>
                    <p>{row.Constructors.map((c) => c.name).join(' / ')}</p>
                    <p className="dim">{row.Driver.nationality}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </AsyncBoundary>
    </div>
  )
}
