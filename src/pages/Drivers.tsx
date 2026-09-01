import { getDriverStandings } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { useAsync } from '../hooks/useAsync'
import { getTeamColor } from '../lib/teamColors'

export function Drivers() {
  const drivers = useAsync(() => getDriverStandings('current'), [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Drivers</h1>
        {drivers.data && <span className="season-tag">{drivers.data.StandingsTable.season} season</span>}
      </div>

      <AsyncBoundary status={drivers.status} error={drivers.error}>
        {drivers.data && (
          <div className="driver-grid">
            {drivers.data.StandingsTable.StandingsLists[0]?.DriverStandings.map((row) => {
              const teamColor = getTeamColor(row.Constructors[0]?.constructorId ?? '')
              return (
                <div className="driver-card" key={row.Driver.driverId} style={{ borderLeftColor: teamColor }}>
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
                </div>
              )
            })}
          </div>
        )}
      </AsyncBoundary>
    </div>
  )
}
