import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getConstructorStandings, getSeasonResults, getSprintPointsByRound } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ChartSkeleton, StatCardsSkeleton, TableSkeleton } from '../components/Skeleton'
import { TeamDot } from '../components/TeamDot'
import { useSeason } from '../context/SeasonContext'
import { useAsync } from '../hooks/useAsync'
import { getTeamColor } from '../lib/teamColors'

export function ConstructorDetail() {
  const { constructorId } = useParams<{ constructorId: string }>()
  const { season } = useSeason()

  const standings = useAsync(() => getConstructorStandings(season), [season])
  const seasonResults = useAsync(() => getSeasonResults(season), [season])
  const sprintPoints = useAsync(() => getSprintPointsByRound(season), [season])

  const status =
    standings.status === 'error' || seasonResults.status === 'error'
      ? 'error'
      : standings.status === 'success' && seasonResults.status === 'success'
        ? 'success'
        : 'loading'
  const error = standings.error ?? seasonResults.error

  const standing = standings.data?.StandingsTable.StandingsLists[0]?.ConstructorStandings.find(
    (row) => row.Constructor.constructorId === constructorId,
  )

  const { rounds, drivers, podiums, bestFinish } = useMemo(() => {
    const rounds: { round: number; raceName: string; points: number; cumulative: number }[] = []
    const drivers = new Map<string, { name: string; points: number; driverId: string }>()
    let cumulative = 0
    let podiums = 0
    let bestFinish: number | null = null

    for (const race of seasonResults.data ?? []) {
      const teamResults = race.Results.filter((r) => r.Constructor.constructorId === constructorId)
      if (teamResults.length === 0) continue

      const sprintForRound = sprintPoints.data?.get(race.round)

      let racePoints = 0
      for (const r of teamResults) {
        const points = Number(r.points) + (sprintForRound?.get(r.Driver.driverId) ?? 0)
        racePoints += points
        const finish = Number(r.position)
        if (finish <= 3) podiums += 1
        if (bestFinish === null || finish < bestFinish) bestFinish = finish

        const existing = drivers.get(r.Driver.driverId)
        if (existing) {
          existing.points += points
        } else {
          drivers.set(r.Driver.driverId, {
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            points,
            driverId: r.Driver.driverId,
          })
        }
      }

      cumulative += racePoints
      rounds.push({ round: Number(race.round), raceName: race.raceName, points: racePoints, cumulative })
    }

    return {
      rounds,
      drivers: Array.from(drivers.values()).sort((a, b) => b.points - a.points),
      podiums,
      bestFinish,
    }
  }, [seasonResults.data, sprintPoints.data, constructorId])

  const teamColor = getTeamColor(constructorId ?? '')

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/standings" className="back-link">
          ← Standings
        </Link>
      </div>

      <AsyncBoundary
        status={status}
        error={error}
        skeleton={
          <>
            <StatCardsSkeleton count={3} />
            <ChartSkeleton height={200} />
            <TableSkeleton rows={10} />
          </>
        }
      >
        {!standing && <div className="status-block">Constructor not found this season.</div>}

        {standing && (
          <>
            <div className="page-header">
              <h1>
                <TeamDot constructorId={standing.Constructor.constructorId} />
                {standing.Constructor.name}
              </h1>
              <span className="season-tag">{standing.Constructor.nationality}</span>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              <div className="stat-card">
                <span className="stat-label">Championship position</span>
                <span className="stat-value">P{standing.position}</span>
                <span className="stat-sub">
                  {standing.points} pts · {standing.wins} wins
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Podiums</span>
                <span className="stat-value">{podiums}</span>
                <span className="stat-sub">Across {rounds.length} rounds</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Best finish</span>
                <span className="stat-value">{bestFinish ? `P${bestFinish}` : '—'}</span>
                <span className="stat-sub">Season best</span>
              </div>
            </div>

            {drivers.length > 0 && (
              <>
                <h2 className="section-title">Drivers</h2>
                <div className="driver-grid" style={{ marginBottom: 24 }}>
                  {drivers.map((d) => (
                    <Link
                      to={`/drivers/${d.driverId}`}
                      className="driver-card"
                      key={d.driverId}
                      style={{ borderLeftColor: teamColor }}
                    >
                      <div className="driver-card-number" style={{ color: teamColor }}>
                        {d.points}
                      </div>
                      <div>
                        <h3>{d.name}</h3>
                        <p className="dim">points this season</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {rounds.length > 0 && (
              <div className="chart-card">
                <p className="chart-title">Cumulative points this season</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={rounds} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="constructorPoints" x1="0" y1="0" x2="0" y2="1">
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
                        const row = rounds.find((r) => r.round === v)
                        return row ? `Round ${v} · ${row.raceName}` : `Round ${v}`
                      }}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke={teamColor} strokeWidth={2} fill="url(#constructorPoints)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rd</th>
                    <th>Race</th>
                    <th>Points</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.round}>
                      <td>{r.round}</td>
                      <td>
                        <Link to={`/races/${r.round}`}>{r.raceName}</Link>
                      </td>
                      <td>{r.points}</td>
                      <td>{r.cumulative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}
