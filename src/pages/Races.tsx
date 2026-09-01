import { Link } from 'react-router-dom'
import { getSchedule } from '../api/f1'
import { AsyncBoundary } from '../components/AsyncBoundary'
import { useAsync } from '../hooks/useAsync'

export function Races() {
  const schedule = useAsync(() => getSchedule('current'), [])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Races</h1>
        {schedule.data && <span className="season-tag">{schedule.data.RaceTable.season} season</span>}
      </div>

      <AsyncBoundary status={schedule.status} error={schedule.error}>
        {schedule.data && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rd</th>
                  <th>Grand Prix</th>
                  <th>Circuit</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {schedule.data.RaceTable.Races.map((race) => (
                  <tr key={race.round} className={race.date < today ? 'past clickable' : 'upcoming clickable'}>
                    <td>{race.round}</td>
                    <td>
                      <Link to={`/races/${race.round}`}>{race.raceName}</Link>
                    </td>
                    <td>
                      {race.Circuit.circuitName}, {race.Circuit.Location.country}
                    </td>
                    <td>{race.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncBoundary>
    </div>
  )
}
