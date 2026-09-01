import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDriverStandings, getSeasonResults } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { TeamDot } from '../components/TeamDot'
import { useAsync } from '../hooks/useAsync'
import { getTeamColor } from '../lib/teamColors'

export function DriverDetail() {
  const { driverId } = useParams<{ driverId: string }>()

  const standings = useAsync(() => getDriverStandings('current'), [])
  const seasonResults = useAsync(() => getSeasonResults('current'), [])

  const status = standings.status === 'error' || seasonResults.status === 'error'
    ? 'error'
    : standings.status === 'success' && seasonResults.status === 'success'
      ? 'success'
      : 'loading'
  const error = standings.error ?? seasonResults.error

  const standing = standings.data?.StandingsTable.StandingsLists[0]?.DriverStandings.find(
    (row) => row.Driver.driverId === driverId,
  )

  const races = useMemo(() => {
    if (!seasonResults.data) return []
    let cumulative = 0
    return seasonResults.data.flatMap((race) => {
      const result = race.Results.find((r) => r.Driver.driverId === driverId)
      if (!result) return []
      cumulative += Number(result.points)
      return [
        {
          round: Number(race.round),
          raceName: race.raceName,
          position: result.position,
          grid: result.grid,
          points: Number(result.points),
          cumulative,
          status: result.status,
        },
      ]
    })
  }, [seasonResults.data, driverId])

  const teamColor = getTeamColor(standing?.Constructors[0]?.constructorId ?? '')

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/drivers" className="back-link">
          ← Drivers
        </Link>
      </div>

      <AsyncBoundary status={status} error={error}>
        {!standing && <div className="status-block">Driver not found this season.</div>}

        {standing && (
          <>
            <div className="page-header">
              <h1>
                {standing.Driver.givenName} {standing.Driver.familyName}
              </h1>
              <span className="season-tag">
                <TeamDot constructorId={standing.Constructors[0]?.constructorId ?? ''} />
                {standing.Constructors.map((c) => c.name).join(' / ')}
              </span>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              <div className="stat-card">
                <span className="stat-label">Championship position</span>
                <span className="stat-value">P{standing.position}</span>
                <span className="stat-sub">{standing.points} pts · {standing.wins} wins</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Number</span>
                <span className="stat-value">{standing.Driver.permanentNumber ?? '—'}</span>
                <span className="stat-sub">{standing.Driver.code ?? ''}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Nationality</span>
                <span className="stat-value">{standing.Driver.nationality}</span>
                <span className="stat-sub">Born {standing.Driver.dateOfBirth}</span>
              </div>
            </div>

            {races.length > 0 && (
              <div className="chart-card">
                <p className="chart-title">Cumulative points this season</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={races} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="driverPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={teamColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={teamColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="round"
                      tickFormatter={(v) => `R${v}`}
                      tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                      labelStyle={{ color: 'var(--text-h)' }}
                      labelFormatter={(v) => {
                        const row = races.find((r) => r.round === v)
                        return row ? `Round ${v} · ${row.raceName}` : `Round ${v}`
                      }}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke={teamColor} strokeWidth={2} fill="url(#driverPoints)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Rd</th>
                  <th>Race</th>
                  <th>Grid</th>
                  <th>Finish</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {races.map((r) => (
                  <tr key={r.round}>
                    <td>{r.round}</td>
                    <td>
                      <Link to={`/races/${r.round}`}>{r.raceName}</Link>
                    </td>
                    <td>{r.grid}</td>
                    <td>{r.status === 'Finished' || r.status.includes('Lap') ? r.position : r.status}</td>
                    <td>{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}
