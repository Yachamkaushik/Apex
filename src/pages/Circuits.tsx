import { useEffect, useMemo, useState } from 'react'
import { F1_CIRCUITS, type CircuitInfo } from '../data/circuits'

export function Circuits() {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [activeCircuit, setActiveCircuit] = useState<CircuitInfo | null>(null)

  // Filter and sort circuits
  const filteredCircuits = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = F1_CIRCUITS.filter((circuit) => {
      const matchesType = selectedType === 'all' || circuit.type === selectedType
      if (!matchesType) return false
      if (!q) return true

      const haystack = [
        circuit.name,
        circuit.officialName,
        circuit.location,
        circuit.country,
        circuit.countryCode,
        circuit.type,
        circuit.lapRecord.driver,
        ...circuit.keyCorners.map((k) => `${k.name} ${k.turnNumber}`),
        ...circuit.characteristics,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })

    return result.sort((a, b) => {
      if (sortBy === 'length-desc') return b.lengthKm - a.lengthKm
      if (sortBy === 'length-asc') return a.lengthKm - b.lengthKm
      if (sortBy === 'turns-desc') return b.turns - a.turns
      if (sortBy === 'turns-asc') return a.turns - b.turns
      return a.name.localeCompare(b.name)
    })
  }, [query, selectedType, sortBy])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCircuit(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>F1 Race Circuits</h1>
        <span className="season-tag">Layouts &amp; Technical Profiles</span>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          className="filter-input"
          placeholder="Search by circuit, country, city, or corner…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search F1 circuits"
        />
        <select
          className="filter-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          aria-label="Filter by circuit type"
        >
          <option value="all">All Circuit Types</option>
          <option value="Permanent">Permanent Facility</option>
          <option value="Street">Street Circuit</option>
          <option value="Hybrid">Hybrid / Semi-Permanent</option>
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort circuits"
        >
          <option value="name-asc">Sort: Name (A–Z)</option>
          <option value="length-desc">Sort: Longest Track</option>
          <option value="length-asc">Sort: Shortest Track</option>
          <option value="turns-desc">Sort: Most Turns</option>
          <option value="turns-asc">Sort: Fewest Turns</option>
        </select>
        <span className="filter-count">
          {filteredCircuits.length} of {F1_CIRCUITS.length}
        </span>
      </div>

      {filteredCircuits.length === 0 ? (
        <div className="status-block">No circuits match your search criteria.</div>
      ) : (
        <div className="circuit-grid">
          {filteredCircuits.map((circuit) => (
            <div
              key={circuit.id}
              className="circuit-card"
              onClick={() => setActiveCircuit(circuit)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveCircuit(circuit)
                }
              }}
              aria-label={`View details for ${circuit.name}`}
            >
              <div className="circuit-card-header">
                <div>
                  <div className="circuit-badges">
                    <span className="circuit-country-badge">{circuit.countryCode}</span>
                    <span className={`circuit-type-badge type-${circuit.type.toLowerCase()}`}>
                      {circuit.type}
                    </span>
                  </div>
                  <h3 className="circuit-title">{circuit.name}</h3>
                  <p className="circuit-location">
                    {circuit.location}, {circuit.country}
                  </p>
                </div>
              </div>

              <div className="circuit-image-wrapper">
                <img
                  src={circuit.image}
                  alt={`${circuit.name} track layout`}
                  className="circuit-image"
                  loading="lazy"
                />
              </div>

              <div className="circuit-quick-specs">
                <div className="circuit-spec-item">
                  <span className="circuit-spec-label">Track Length</span>
                  <span className="circuit-spec-val">{circuit.lengthKm.toFixed(3)} km</span>
                </div>
                <div className="circuit-spec-item">
                  <span className="circuit-spec-label">Turns</span>
                  <span className="circuit-spec-val">{circuit.turns}</span>
                </div>
                <div className="circuit-spec-item">
                  <span className="circuit-spec-label">DRS Zones</span>
                  <span className="circuit-spec-val">{circuit.drsZones}</span>
                </div>
                <div className="circuit-spec-item">
                  <span className="circuit-spec-label">Lap Record</span>
                  <span className="circuit-spec-val">{circuit.lapRecord.time}</span>
                </div>
              </div>

              <div className="circuit-card-footer">
                <div className="circuit-tags-preview">
                  <span className="circuit-feature-pill">
                    {circuit.characteristics[0]}
                  </span>
                </div>
                <button
                  type="button"
                  className="circuit-inspect-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveCircuit(circuit)
                  }}
                >
                  Track Intel &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal Dialog */}
      {activeCircuit && (
        <div className="modal-backdrop" onClick={() => setActiveCircuit(null)}>
          <div
            className="modal-content circuit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="circuit-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {activeCircuit.country} &middot; {activeCircuit.type} Circuit &middot; Est. {activeCircuit.firstGrandPrix}
                </span>
                <h2 id="circuit-modal-title" className="modal-title">
                  {activeCircuit.officialName}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveCircuit(null)}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="circuit-modal-body">
              <div className="circuit-modal-hero">
                <img
                  src={activeCircuit.image}
                  alt={`${activeCircuit.name} track diagram`}
                  className="circuit-modal-image"
                />
              </div>

              <p className="circuit-modal-desc">{activeCircuit.description}</p>

              <div className="circuit-specs-grid">
                <div className="circuit-specs-card">
                  <h4 className="circuit-specs-heading">Circuit Telemetry &amp; Layout</h4>
                  <dl className="circuit-specs-dl">
                    <dt>Circuit Length</dt>
                    <dd className="stat-value-inline">{activeCircuit.lengthKm.toFixed(3)} km ({(activeCircuit.lengthKm * 0.621371).toFixed(3)} mi)</dd>
                    <dt>Number of Turns</dt>
                    <dd className="stat-value-inline">{activeCircuit.turns}</dd>
                    <dt>DRS Zones</dt>
                    <dd className="stat-value-inline">{activeCircuit.drsZones} zones</dd>
                    <dt>Race Distance</dt>
                    <dd className="stat-value-inline">{activeCircuit.raceLaps} Laps ({activeCircuit.raceDistanceKm.toFixed(3)} km)</dd>
                    <dt>Full Throttle</dt>
                    <dd className="stat-value-inline">{activeCircuit.fullThrottlePercentage}</dd>
                    <dt>First Grand Prix</dt>
                    <dd>{activeCircuit.firstGrandPrix}</dd>
                  </dl>
                </div>

                <div className="circuit-specs-card">
                  <h4 className="circuit-specs-heading">Engineering &amp; Setup Demands</h4>
                  <dl className="circuit-specs-dl">
                    <dt>Aero Downforce</dt>
                    <dd>{activeCircuit.downforceLevel}</dd>
                    <dt>Tire Stress</dt>
                    <dd>{activeCircuit.tireStress}</dd>
                    <dt>Overtaking</dt>
                    <dd>{activeCircuit.overtakingDifficulty}</dd>
                    <dt>Lap Record</dt>
                    <dd className="stat-value-inline">{activeCircuit.lapRecord.time}</dd>
                    <dt>Record Holder</dt>
                    <dd>{activeCircuit.lapRecord.driver} ({activeCircuit.lapRecord.team}, {activeCircuit.lapRecord.year})</dd>
                    <dt>Track Category</dt>
                    <dd>{activeCircuit.type}</dd>
                  </dl>
                </div>
              </div>

              {activeCircuit.keyCorners.length > 0 && (
                <div className="circuit-corners-card">
                  <h4 className="circuit-specs-heading">Key Corners &amp; Racing Sectors</h4>
                  <div className="circuit-corners-list">
                    {activeCircuit.keyCorners.map((corner, i) => (
                      <div key={i} className="circuit-corner-item">
                        <div className="circuit-corner-header">
                          <span className="circuit-corner-turn">{corner.turnNumber}</span>
                          <strong className="circuit-corner-name">{corner.name}</strong>
                        </div>
                        <p className="circuit-corner-desc">{corner.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="circuit-features-card">
                <h4 className="circuit-specs-heading">Key Characteristics &amp; Tactical Factors</h4>
                <ul className="circuit-features-list">
                  {activeCircuit.characteristics.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
