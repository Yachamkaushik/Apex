import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  getConstructorStandings,
  getDriverStandings,
  getSchedule,
  getSeasonResults,
  getSprintPointsByRound,
} from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ChartSkeleton, StatCardsSkeleton } from '../components/Skeleton'
import { TeamDot } from '../components/TeamDot'
import { useSeason } from '../context/SeasonContext'
import { useAsync } from '../hooks/useAsync'
import { buildPointsProgression } from '../lib/pointsProgression'
import { getTeamColor } from '../lib/teamColors'

/** Days between today and an ISO date string, rounded up. */
function daysUntil(isoDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${isoDate}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

export function Dashboard() {
  const { season } = useSeason()
  const drivers = useAsync(() => getDriverStandings(season), [season])
  const constructors = useAsync(() => getConstructorStandings(season), [season])
  const schedule = useAsync(() => getSchedule(season), [season])
  const seasonResults = useAsync(() => getSeasonResults(season), [season])
  const sprintPoints = useAsync(() => getSprintPointsByRound(season), [season])

  const core = [drivers, constructors, schedule]
  const status = core.some((s) => s.status === 'error')
    ? 'error'
    : core.every((s) => s.status === 'success')
      ? 'success'
      : 'loading'
  const error = drivers.error ?? constructors.error ?? schedule.error

  const seasonLabel = drivers.data?.StandingsTable.season
  const driverRows = drivers.data?.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
  const constructorRows = constructors.data?.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []

  const leader = driverRows[0]
  const runnerUp = driverRows[1]
  const gap = leader && runnerUp ? Number(leader.points) - Number(runnerUp.points) : null

  const constructorLeader = constructorRows[0]

  const today = new Date().toISOString().slice(0, 10)
  const races = schedule.data?.RaceTable.Races ?? []
  const nextRace = races.find((race) => race.date >= today)
  const completed = races.filter((race) => race.date < today).length

  const lastRace = seasonResults.data?.[seasonResults.data.length - 1]
  const podium = lastRace?.Results.slice(0, 3) ?? []

  const progression = useMemo(
    () =>
      seasonResults.data
        ? buildPointsProgression(seasonResults.data, 5, sprintPoints.data ?? undefined)
        : null,
    [seasonResults.data, sprintPoints.data],
  )

  const constructorChart = constructorRows.map((row) => ({
    name: row.Constructor.name,
    points: Number(row.points),
    constructorId: row.Constructor.constructorId,
  }))

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        {seasonLabel && <span className="season-tag">{seasonLabel} season</span>}
      </div>

      <AsyncBoundary
        status={status}
        error={error}
        skeleton={
          <>
            <StatCardsSkeleton count={4} />
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        }
      >
        <div className="dashboard-grid">
          <div className="stat-card">
            <span className="stat-label">Championship leader</span>
            {leader ? (
              <>
                <span className="stat-value">
                  <Link to={`/drivers/${leader.Driver.driverId}`}>
                    {leader.Driver.givenName} {leader.Driver.familyName}
                  </Link>
                </span>
                <span className="stat-sub">
                  <TeamDot constructorId={leader.Constructors[0]?.constructorId ?? ''} />
                  {leader.points} pts
                  {gap !== null && gap > 0 && ` · +${gap} ahead`}
                </span>
              </>
            ) : (
              <span className="stat-sub">No data yet this season</span>
            )}
          </div>

          <div className="stat-card">
            <span className="stat-label">Constructor leader</span>
            {constructorLeader ? (
              <>
                <span className="stat-value">
                  <Link to={`/constructors/${constructorLeader.Constructor.constructorId}`}>
                    {constructorLeader.Constructor.name}
                  </Link>
                </span>
                <span className="stat-sub">
                  <TeamDot constructorId={constructorLeader.Constructor.constructorId} />
                  {constructorLeader.points} pts · {constructorLeader.wins} wins
                </span>
              </>
            ) : (
              <span className="stat-sub">No data yet this season</span>
            )}
          </div>

          <div className="stat-card">
            <span className="stat-label">Next race</span>
            {nextRace ? (
              <>
                <span className="stat-value">{nextRace.raceName}</span>
                <span className="stat-sub">
                  {nextRace.Circuit.Location.country} ·{' '}
                  {daysUntil(nextRace.date) === 0
                    ? 'today'
                    : `in ${daysUntil(nextRace.date)} day${daysUntil(nextRace.date) === 1 ? '' : 's'}`}
                </span>
              </>
            ) : (
              <span className="stat-sub">Season complete</span>
            )}
          </div>

          <div className="stat-card">
            <span className="stat-label">Season progress</span>
            <span className="stat-value">
              {completed} / {races.length}
            </span>
            <span className="stat-sub">rounds completed</span>
            {races.length > 0 && (
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${(completed / races.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {podium.length > 0 && lastRace && (
          <>
            <h2 className="section-title">
              Last race · <Link to={`/races/${lastRace.round}`}>{lastRace.raceName}</Link>
            </h2>
            <div className="podium-grid">
              {podium.map((result) => {
                const isWinner = result.position === '1'
                const badgeColor = isWinner ? '#d4af37' : getTeamColor(result.Constructor.constructorId)
                return (
                <Link
                  to={`/drivers/${result.Driver.driverId}`}
                  className={`driver-card${isWinner ? ' podium-first' : ''}`}
                  key={result.Driver.driverId}
                  style={{ borderLeftColor: badgeColor }}
                >
                  <div className="driver-card-number" style={{ color: badgeColor }}>
                    P{result.position}
                  </div>
                  <div>
                    <h3>
                      {result.Driver.givenName} {result.Driver.familyName}
                    </h3>
                    <p>{result.Constructor.name}</p>
                    <p className="dim">{result.Time?.time ?? result.status}</p>
                  </div>
                </Link>
                )
              })}
            </div>
          </>
        )}

        {progression && progression.rows.length > 0 && (
          <div className="chart-card">
            <p className="chart-title">Title fight · cumulative points (top 5)</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={progression.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                    const row = progression.rows.find((r) => r.round === v)
                    return row ? `Round ${v} · ${row.raceName}` : `Round ${v}`
                  }}
                />
                {progression.driverIds.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    name={progression.driverMeta[id].code}
                    stroke={getTeamColor(progression.driverMeta[id].constructorId)}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {constructorChart.length > 0 && (
          <div className="chart-card">
            <p className="chart-title">Constructors' championship</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={constructorChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} interval={0} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-elevated)' }}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                  {constructorChart.map((entry) => (
                    <Cell key={entry.name} fill={getTeamColor(entry.constructorId)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AsyncBoundary>
    </div>
  )
}
