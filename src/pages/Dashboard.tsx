import { getDriverStandings, getSchedule } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { TeamDot } from '../components/TeamDot'
import { useAsync } from '../hooks/useAsync'

export function Dashboard() {
  const drivers = useAsync(() => getDriverStandings('current'), [])
  const schedule = useAsync(() => getSchedule('current'), [])

  const status = drivers.status === 'success' && schedule.status === 'success' ? 'success' : drivers.status === 'error' || schedule.status === 'error' ? 'error' : 'loading'
  const error = drivers.error ?? schedule.error

  const leader = drivers.data?.StandingsTable.StandingsLists[0]?.DriverStandings[0]
  const today = new Date().toISOString().slice(0, 10)
  const nextRace = schedule.data?.RaceTable.Races.find((race) => race.date >= today)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        {drivers.data && <span className="season-tag">{drivers.data.StandingsTable.season} season</span>}
      </div>

      <AsyncBoundary status={status} error={error}>
        <div className="dashboard-grid">
          <div className="stat-card">
            <span className="stat-label">Championship leader</span>
            {leader ? (
              <>
                <span className="stat-value">
                  {leader.Driver.givenName} {leader.Driver.familyName}
                </span>
                <span className="stat-sub">
                  <TeamDot constructorId={leader.Constructors[0]?.constructorId ?? ''} />
                  {leader.points} pts · {leader.Constructors.map((c) => c.name).join(' / ')}
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
                  {nextRace.Circuit.circuitName} · {nextRace.date}
                </span>
              </>
            ) : (
              <span className="stat-sub">Season complete</span>
            )}
          </div>
        </div>
      </AsyncBoundary>
    </div>
  )
}
