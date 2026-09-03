import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getConstructorStandings, getDriverStandings, getSeasonResults, getSprintPointsByRound } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ChartSkeleton, TableSkeleton } from '../components/Skeleton'
import { TeamDot } from '../components/TeamDot'
import { useSeason } from '../context/SeasonContext'
import { useAsync } from '../hooks/useAsync'
import { buildPointsProgression } from '../lib/pointsProgression'
import { getTeamColor } from '../lib/teamColors'

type Tab = 'drivers' | 'constructors'

export function Standings() {
  const { season } = useSeason()
  const [tab, setTab] = useState<Tab>('drivers')

  const drivers = useAsync(() => getDriverStandings(season), [season])
  const constructors = useAsync(() => getConstructorStandings(season), [season])
  const seasonResults = useAsync(() => getSeasonResults(season), [season])
  const sprintPoints = useAsync(() => getSprintPointsByRound(season), [season])

  const seasonLabel = drivers.data?.StandingsTable.season

  const driverRows = drivers.data?.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
  const constructorRows = constructors.data?.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []

  const driverChartData = driverRows.map((row) => ({
    name: row.Driver.code ?? row.Driver.familyName,
    points: Number(row.points),
    constructorId: row.Constructors[0]?.constructorId ?? '',
  }))

  const constructorChartData = constructorRows.map((row) => ({
    name: row.Constructor.name,
    points: Number(row.points),
    constructorId: row.Constructor.constructorId,
  }))

  const progression = useMemo(
    () =>
      seasonResults.data
        ? buildPointsProgression(seasonResults.data, 6, sprintPoints.data ?? undefined)
        : null,
    [seasonResults.data, sprintPoints.data],
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1>Standings</h1>
        {seasonLabel && <span className="season-tag">{seasonLabel} season</span>}
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'drivers' ? 'active' : ''}
          onClick={() => setTab('drivers')}
        >
          Drivers
        </button>
        <button
          type="button"
          className={tab === 'constructors' ? 'active' : ''}
          onClick={() => setTab('constructors')}
        >
          Constructors
        </button>
      </div>

      {tab === 'drivers' && (
        <AsyncBoundary
          status={drivers.status}
          error={drivers.error}
          skeleton={
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <TableSkeleton rows={10} />
            </>
          }
        >
          {progression && (
            <div className="chart-card">
              <p className="chart-title">Points progression (top 6)</p>
              <ResponsiveContainer width="100%" height={280}>
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
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-dim)' }} />
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

          <div className="chart-card">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={driverChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-elevated)' }}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                  {driverChartData.map((entry) => (
                    <Cell key={entry.name} fill={getTeamColor(entry.constructorId)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Wins</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {driverRows.map((row) => (
                  <tr key={row.Driver.driverId}>
                    <td>{row.position}</td>
                    <td>
                      <Link to={`/drivers/${row.Driver.driverId}`}>
                        {row.Driver.givenName} {row.Driver.familyName}
                      </Link>
                    </td>
                    <td>
                      <TeamDot constructorId={row.Constructors[0]?.constructorId ?? ''} />
                      {row.Constructors.map((c) => c.name).join(' / ')}
                    </td>
                    <td>{row.wins}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AsyncBoundary>
      )}

      {tab === 'constructors' && (
        <AsyncBoundary
          status={constructors.status}
          error={constructors.error}
          skeleton={
            <>
              <ChartSkeleton />
              <TableSkeleton rows={10} />
            </>
          }
        >
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={constructorChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-elevated)' }}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                  {constructorChartData.map((entry) => (
                    <Cell key={entry.name} fill={getTeamColor(entry.constructorId)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Constructor</th>
                  <th>Wins</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {constructorRows.map((row) => (
                  <tr key={row.Constructor.constructorId}>
                    <td>{row.position}</td>
                    <td>
                      <TeamDot constructorId={row.Constructor.constructorId} />
                      <Link to={`/constructors/${row.Constructor.constructorId}`}>{row.Constructor.name}</Link>
                    </td>
                    <td>{row.wins}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AsyncBoundary>
      )}
    </div>
  )
}
