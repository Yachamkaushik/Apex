import { Link, useParams } from 'react-router-dom'
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getRaceResults } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { TeamDot } from '../components/TeamDot'
import { useAsync } from '../hooks/useAsync'
import { getTeamColor } from '../lib/teamColors'

export function RaceDetail() {
  const { round } = useParams<{ round: string }>()
  const roundNumber = Number(round)

  const race = useAsync(() => getRaceResults('current', roundNumber), [roundNumber])
  const data = race.data?.RaceTable.Races[0]
  const results = data?.Results ?? []

  const chartData = results
    .filter((r) => Number(r.grid) > 0)
    .map((r) => ({
      name: r.Driver.code ?? r.Driver.familyName,
      delta: Number(r.grid) - Number(r.position),
      constructorId: r.Constructor.constructorId,
    }))

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/races" className="back-link">
          ← Races
        </Link>
      </div>

      <AsyncBoundary status={race.status} error={race.error}>
        {!data && <div className="status-block">No results yet for this race.</div>}
        {data && (
          <>
            <div className="page-header">
              <h1>{data.raceName}</h1>
              <span className="season-tag">Round {data.round}</span>
            </div>
            <p className="dim" style={{ marginBottom: 24 }}>
              {data.Circuit.circuitName}, {data.Circuit.Location.locality}, {data.Circuit.Location.country} · {data.date}
            </p>

            {chartData.length > 0 && (
              <div className="chart-card">
                <p className="chart-title">Positions gained / lost (grid → finish)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                    <ReferenceLine y={0} stroke="var(--border)" />
                    <Tooltip
                      cursor={{ fill: 'var(--bg-elevated)' }}
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                      labelStyle={{ color: 'var(--text-h)' }}
                    />
                    <Bar dataKey="delta" radius={[4, 4, 4, 4]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={getTeamColor(entry.constructorId)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Grid</th>
                  <th>Laps</th>
                  <th>Time / Status</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.Driver.driverId}>
                    <td>{r.position}</td>
                    <td>
                      {r.Driver.givenName} {r.Driver.familyName}
                    </td>
                    <td>
                      <TeamDot constructorId={r.Constructor.constructorId} />
                      {r.Constructor.name}
                    </td>
                    <td>{r.grid}</td>
                    <td>{r.laps}</td>
                    <td>{r.Time?.time ?? r.status}</td>
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
