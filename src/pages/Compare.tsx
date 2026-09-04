import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDriverStandings, getSeasonResults } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { ChartSkeleton, TableSkeleton } from '../components/Skeleton'
import { CountUp } from '../components/CountUp'
import { TeamDot } from '../components/TeamDot'
import { useSeason } from '../context/SeasonContext'
import { useAsync } from '../hooks/useAsync'
import type { DriverStanding } from '../types/f1'

const chartAxisProps = {
  tick: { fill: 'var(--text-dim)', fontSize: 12 },
  axisLine: { stroke: 'var(--border)' },
  tickLine: false,
}

function DriverPicker({
  label,
  value,
  onChange,
  drivers,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  drivers: DriverStanding[]
}) {
  return (
    <select className="filter-select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {drivers.map((d) => (
        <option key={d.Driver.driverId} value={d.Driver.driverId}>
          {d.Driver.givenName} {d.Driver.familyName}
        </option>
      ))}
    </select>
  )
}

export function Compare() {
  const { season } = useSeason()
  const [params, setParams] = useSearchParams()

  const standings = useAsync(() => getDriverStandings(season), [season])
  const seasonResults = useAsync(() => getSeasonResults(season), [season])

  const rows = standings.data?.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
  const idA = params.get('a') || rows[0]?.Driver.driverId || ''
  const idB = params.get('b') || rows[1]?.Driver.driverId || ''

  const setA = (id: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('a', id)
      return next
    })
  const setB = (id: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('b', id)
      return next
    })

  const standingA = rows.find((r) => r.Driver.driverId === idA)
  const standingB = rows.find((r) => r.Driver.driverId === idB)

  const status = standings.status === 'error' || seasonResults.status === 'error'
    ? 'error'
    : standings.status === 'success' && seasonResults.status === 'success'
      ? 'success'
      : 'loading'
  const error = standings.error ?? seasonResults.error

  const { chartRows, raceRows, tally } = useMemo(() => {
    if (!seasonResults.data || !idA || !idB) return { chartRows: [], raceRows: [], tally: { a: 0, b: 0 } }

    let cumA = 0
    let cumB = 0
    let aheadA = 0
    let aheadB = 0
    const chartRows: { round: number; a: number; b: number }[] = []
    const raceRows: {
      round: number
      raceName: string
      posA: string | null
      posB: string | null
      ptsA: number
      ptsB: number
    }[] = []

    for (const race of seasonResults.data) {
      const resultA = race.Results.find((r) => r.Driver.driverId === idA)
      const resultB = race.Results.find((r) => r.Driver.driverId === idB)
      if (!resultA && !resultB) continue

      const ptsA = Number(resultA?.points ?? 0)
      const ptsB = Number(resultB?.points ?? 0)
      cumA += ptsA
      cumB += ptsB
      chartRows.push({ round: Number(race.round), a: cumA, b: cumB })

      if (resultA && resultB) {
        const posA = Number(resultA.position)
        const posB = Number(resultB.position)
        if (Number.isFinite(posA) && Number.isFinite(posB)) {
          if (posA < posB) aheadA += 1
          else if (posB < posA) aheadB += 1
        }
      }

      raceRows.push({
        round: Number(race.round),
        raceName: race.raceName,
        posA: resultA?.position ?? null,
        posB: resultB?.position ?? null,
        ptsA,
        ptsB,
      })
    }

    return { chartRows, raceRows, tally: { a: aheadA, b: aheadB } }
  }, [seasonResults.data, idA, idB])

  // Fixed, team-independent colors so a same-team comparison (frequent —
  // it's often two teammates people want to compare) still reads clearly;
  // team color is still shown via the TeamDot next to each name.
  const colorA = 'var(--accent)'
  const colorB = '#3d8bfd'

  return (
    <div className="page">
      <div className="page-header">
        <h1>Compare</h1>
      </div>

      <AsyncBoundary
        status={status}
        error={error}
        skeleton={
          <>
            <ChartSkeleton />
            <TableSkeleton rows={10} />
          </>
        }
      >
        {rows.length > 0 && (
          <>
            <div className="filter-bar">
              <DriverPicker label="Driver A" value={idA} onChange={setA} drivers={rows} />
              <span className="stat-sub">vs</span>
              <DriverPicker label="Driver B" value={idB} onChange={setB} drivers={rows} />
            </div>

            {standingA && standingB && (
              <div className="dashboard-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <span className="stat-label">
                    <TeamDot constructorId={standingA.Constructors[0]?.constructorId ?? ''} />
                    {standingA.Driver.givenName} {standingA.Driver.familyName}
                  </span>
                  <span className="stat-value" style={{ color: colorA }}>
                    P{standingA.position}
                  </span>
                  <span className="stat-sub"><CountUp value={Number(standingA.points)} /> pts · {standingA.wins} wins</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Head-to-head finishes</span>
                  <span className="stat-value">
                    <CountUp value={tally.a} /> – <CountUp value={tally.b} />
                  </span>
                  <span className="stat-sub">races both finished, who was ahead</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">
                    <TeamDot constructorId={standingB.Constructors[0]?.constructorId ?? ''} />
                    {standingB.Driver.givenName} {standingB.Driver.familyName}
                  </span>
                  <span className="stat-value" style={{ color: colorB }}>
                    P{standingB.position}
                  </span>
                  <span className="stat-sub"><CountUp value={Number(standingB.points)} /> pts · {standingB.wins} wins</span>
                </div>
              </div>
            )}

            {chartRows.length > 0 && standingA && standingB && (
              <div className="chart-card">
                <p className="chart-title">Cumulative points</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="round" tickFormatter={(v) => `R${v}`} {...chartAxisProps} />
                    <YAxis {...chartAxisProps} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}
                      labelStyle={{ color: 'var(--text-h)' }}
                      labelFormatter={(v) => `Round ${v}`}
                    />
                    <Line type="monotone" dataKey="a" name={standingA.Driver.code ?? standingA.Driver.familyName} stroke={colorA} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="b" name={standingB.Driver.code ?? standingB.Driver.familyName} stroke={colorB} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {raceRows.length > 0 && standingA && standingB && (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rd</th>
                      <th>Race</th>
                      <th>{standingA.Driver.code ?? 'A'}</th>
                      <th>{standingB.Driver.code ?? 'B'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raceRows.map((r) => (
                      <tr key={r.round}>
                        <td>{r.round}</td>
                        <td>{r.raceName}</td>
                        <td style={{ color: r.posA && r.posB && Number(r.posA) < Number(r.posB) ? colorA : undefined }}>
                          {r.posA ? `P${r.posA}` : '—'}
                        </td>
                        <td style={{ color: r.posA && r.posB && Number(r.posB) < Number(r.posA) ? colorB : undefined }}>
                          {r.posB ? `P${r.posB}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}
