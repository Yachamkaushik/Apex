import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getConstructorStandings, getDriverStandings } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { TeamDot } from '../components/TeamDot'
import { useAsync } from '../hooks/useAsync'
import { getTeamColor } from '../lib/teamColors'

type Tab = 'drivers' | 'constructors'

export function Standings() {
  const [tab, setTab] = useState<Tab>('drivers')

  const drivers = useAsync(() => getDriverStandings('current'), [])
  const constructors = useAsync(() => getConstructorStandings('current'), [])

  const season = drivers.data?.StandingsTable.season

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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Standings</h1>
        {season && <span className="season-tag">{season} season</span>}
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
        <AsyncBoundary status={drivers.status} error={drivers.error}>
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
                    {row.Driver.givenName} {row.Driver.familyName}
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
        </AsyncBoundary>
      )}

      {tab === 'constructors' && (
        <AsyncBoundary status={constructors.status} error={constructors.error}>
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
                    {row.Constructor.name}
                  </td>
                  <td>{row.wins}</td>
                  <td>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AsyncBoundary>
      )}
    </div>
  )
}
