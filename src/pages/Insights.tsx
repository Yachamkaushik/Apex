import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getSeasonPitStops, getSeasonResults } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { TeamDot } from '../components/TeamDot'
import { useSeason } from '../context/SeasonContext'
import { useAsync } from '../hooks/useAsync'
import { formatSeconds } from '../lib/lapTime'
import { buildFastestLapByRound, buildPaceGapTrend } from '../lib/pace'
import { buildPitStopStats } from '../lib/pitStops'
import { buildReliability } from '../lib/reliability'
import { getTeamColor } from '../lib/teamColors'
import { ChartSkeleton, TableSkeleton } from '../components/Skeleton'

type Tab = 'reliability' | 'pace' | 'pitstops'

const chartAxisProps = {
  tick: { fill: 'var(--text-dim)', fontSize: 11 },
  axisLine: { stroke: 'var(--border)' },
  tickLine: false,
}

export function Insights() {
  const { season } = useSeason()
  const [tab, setTab] = useState<Tab>('reliability')

  const seasonResults = useAsync(() => getSeasonResults(season), [season])
  const pitStops = useAsync(() => getSeasonPitStops(season), [season])

  const reliability = useMemo(
    () => (seasonResults.data ? buildReliability(seasonResults.data) : null),
    [seasonResults.data],
  )
  const paceTrend = useMemo(
    () => (seasonResults.data ? buildPaceGapTrend(seasonResults.data, 6) : null),
    [seasonResults.data],
  )
  const fastestLaps = useMemo(
    () => (seasonResults.data ? buildFastestLapByRound(seasonResults.data) : []),
    [seasonResults.data],
  )
  const pitStats = useMemo(
    () => (seasonResults.data && pitStops.data ? buildPitStopStats(seasonResults.data, pitStops.data) : null),
    [seasonResults.data, pitStops.data],
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1>Insights</h1>
      </div>

      <div className="tabs">
        <button type="button" className={tab === 'reliability' ? 'active' : ''} onClick={() => setTab('reliability')}>
          Reliability
        </button>
        <button type="button" className={tab === 'pace' ? 'active' : ''} onClick={() => setTab('pace')}>
          Pace
        </button>
        <button type="button" className={tab === 'pitstops' ? 'active' : ''} onClick={() => setTab('pitstops')}>
          Pit stops
        </button>
      </div>

      {tab === 'reliability' && (
        <AsyncBoundary
          status={seasonResults.status}
          error={seasonResults.error}
          skeleton={
            <>
              <ChartSkeleton height={200} />
              <TableSkeleton rows={10} />
            </>
          }
        >
          {reliability && (
            <>
              {reliability.causes.length > 0 && (
                <div className="chart-card">
                  <p className="chart-title">DNF causes this season</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={reliability.causes} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                      <XAxis dataKey="cause" {...chartAxisProps} interval={0} angle={-30} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} {...chartAxisProps} />
                      <Tooltip
                        cursor={{ fill: 'var(--bg-elevated)' }}
                        contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}
                        labelStyle={{ color: 'var(--text-h)' }}
                      />
                      <Bar dataKey="count" fill="var(--accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Driver</th>
                      <th>Team</th>
                      <th>Starts</th>
                      <th>Finishes</th>
                      <th>DNFs</th>
                      <th>Finish rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reliability.drivers.map((d) => (
                      <tr key={d.driverId}>
                        <td>
                          <Link to={`/drivers/${d.driverId}`}>{d.name}</Link>
                        </td>
                        <td>
                          <TeamDot constructorId={d.constructorId} />
                        </td>
                        <td>{d.starts}</td>
                        <td>{d.finishes}</td>
                        <td>{d.dnfs}</td>
                        <td>{d.finishRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </AsyncBoundary>
      )}

      {tab === 'pace' && (
        <AsyncBoundary
          status={seasonResults.status}
          error={seasonResults.error}
          skeleton={
            <>
              <ChartSkeleton height={220} />
              <TableSkeleton rows={10} />
            </>
          }
        >
          {paceTrend && paceTrend.rows.length > 0 && (
            <div className="chart-card">
              <p className="chart-title">Gap to fastest lap, by round (lower is quicker)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={paceTrend.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="round" tickFormatter={(v) => `R${v}`} {...chartAxisProps} />
                  <YAxis tickFormatter={(v) => `+${v}s`} {...chartAxisProps} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}
                    labelStyle={{ color: 'var(--text-h)' }}
                    formatter={(value, name) => [`+${value}s`, name]}
                    labelFormatter={(v) => {
                      const row = paceTrend.rows.find((r) => r.round === v)
                      return row ? `Round ${v} · ${row.raceName}` : `Round ${v}`
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-dim)' }} />
                  {paceTrend.driverIds.map((id) => (
                    <Line
                      key={id}
                      type="monotone"
                      dataKey={id}
                      name={paceTrend.driverMeta[id].code}
                      stroke={getTeamColor(paceTrend.driverMeta[id].constructorId)}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rd</th>
                  <th>Race</th>
                  <th>Fastest lap</th>
                  <th>Team</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {fastestLaps.map((f) => (
                  <tr key={f.round}>
                    <td>{f.round}</td>
                    <td>
                      <Link to={`/races/${f.round}`}>{f.raceName}</Link>
                    </td>
                    <td>
                      <Link to={`/drivers/${f.driverId}`}>{f.name}</Link>
                    </td>
                    <td>
                      <TeamDot constructorId={f.constructorId} />
                    </td>
                    <td>{formatSeconds(f.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AsyncBoundary>
      )}

      {tab === 'pitstops' && (
        <AsyncBoundary
          status={pitStops.status === 'error' || seasonResults.status === 'error' ? 'error' : pitStops.status === 'success' && seasonResults.status === 'success' ? 'success' : 'loading'}
          error={pitStops.error ?? seasonResults.error}
          skeleton={
            <>
              <ChartSkeleton height={220} />
              <TableSkeleton rows={10} />
            </>
          }
        >
          {pitStats && pitStats.teams.length > 0 && (
            <div className="chart-card">
              <p className="chart-title">Average pit stop duration by team</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={pitStats.teams} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" {...chartAxisProps} />
                  <YAxis tickFormatter={(v) => `${v}s`} {...chartAxisProps} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-elevated)' }}
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}
                    labelStyle={{ color: 'var(--text-h)' }}
                    formatter={(value) => [`${value}s`, 'Avg duration']}
                  />
                  <Bar dataKey="avgDuration">
                    {pitStats.teams.map((t) => (
                      <Cell key={t.constructorId} fill={getTeamColor(t.constructorId)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {pitStats && pitStats.teams.length === 0 && (
            <div className="status-block">No pit stop timing data for this season.</div>
          )}

          {pitStats && pitStats.fastest.length > 0 && (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Team</th>
                    <th>Race</th>
                    <th>Lap</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {pitStats.fastest.map((s, i) => (
                    <tr key={`${s.round}-${s.driverId}-${i}`}>
                      <td>
                        <Link to={`/drivers/${s.driverId}`}>{s.name}</Link>
                      </td>
                      <td>
                        <TeamDot constructorId={s.constructorId} />
                      </td>
                      <td>
                        <Link to={`/races/${s.round}`}>{s.raceName}</Link>
                      </td>
                      <td>{s.lap}</td>
                      <td>{s.duration.toFixed(3)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncBoundary>
      )}
    </div>
  )
}
