import { useState } from 'react'
import { getConstructorStandings, getDriverStandings } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { useAsync } from '../hooks/useAsync'

type Tab = 'drivers' | 'constructors'

export function Standings() {
  const [tab, setTab] = useState<Tab>('drivers')

  const drivers = useAsync(() => getDriverStandings('current'), [])
  const constructors = useAsync(() => getConstructorStandings('current'), [])

  const season = drivers.data?.StandingsTable.season

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
          {drivers.data && (
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
                {drivers.data.StandingsTable.StandingsLists[0]?.DriverStandings.map((row) => (
                  <tr key={row.Driver.driverId}>
                    <td>{row.position}</td>
                    <td>
                      {row.Driver.givenName} {row.Driver.familyName}
                    </td>
                    <td>{row.Constructors.map((c) => c.name).join(' / ')}</td>
                    <td>{row.wins}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncBoundary>
      )}

      {tab === 'constructors' && (
        <AsyncBoundary status={constructors.status} error={constructors.error}>
          {constructors.data && (
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
                {constructors.data.StandingsTable.StandingsLists[0]?.ConstructorStandings.map((row) => (
                  <tr key={row.Constructor.constructorId}>
                    <td>{row.position}</td>
                    <td>{row.Constructor.name}</td>
                    <td>{row.wins}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncBoundary>
      )}
    </div>
  )
}
