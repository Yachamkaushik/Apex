import { useEffect, useMemo, useState } from 'react'
import { F1_CARS, type CarSpec } from '../data/cars'
import { getTeamColor } from '../lib/teamColors'

export function Cars() {
  const [query, setQuery] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [activeCar, setActiveCar] = useState<CarSpec | null>(null)

  // Extract unique power unit suppliers for filter dropdown
  const suppliers = useMemo(() => {
    const list = Array.from(new Set(F1_CARS.map((c) => c.powerUnit.supplier)))
    return list.sort()
  }, [])

  // Filter cars based on search query and power unit supplier
  const filteredCars = useMemo(() => {
    const q = query.trim().toLowerCase()
    return F1_CARS.filter((car) => {
      const matchesSupplier =
        selectedSupplier === 'all' || car.powerUnit.supplier === selectedSupplier

      if (!matchesSupplier) return false
      if (!q) return true

      const haystack = [
        car.teamName,
        car.chassis,
        car.powerUnit.supplier,
        car.powerUnit.name,
        ...car.drivers.map((d) => `${d.name} ${d.code} ${d.number}`),
        ...car.keyInnovations,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [query, selectedSupplier])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCar(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>F1 Cars &amp; Chassis</h1>
        <span className="season-tag">Technical Specs &amp; Liveries</span>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          className="filter-input"
          placeholder="Search by chassis, team, power unit, or driver…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search F1 cars"
        />
        <select
          className="filter-select"
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          aria-label="Filter by power unit"
        >
          <option value="all">All Power Units</option>
          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="filter-count">
          {filteredCars.length} of {F1_CARS.length}
        </span>
      </div>

      {filteredCars.length === 0 ? (
        <div className="status-block">No cars match your search criteria.</div>
      ) : (
        <div className="car-grid">
          {filteredCars.map((car) => {
            const teamColor = getTeamColor(car.constructorId)
            return (
              <div
                key={car.id}
                className="car-card"
                style={{ borderLeftColor: teamColor }}
                onClick={() => setActiveCar(car)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveCar(car)
                  }
                }}
                aria-label={`View details for ${car.teamName} ${car.chassis}`}
              >
                <div className="car-card-header">
                  <div>
                    <span className="car-team-badge" style={{ color: teamColor }}>
                      {car.teamName}
                    </span>
                    <h3 className="car-chassis-title">{car.chassis}</h3>
                  </div>
                  <span className="car-power-badge">{car.powerUnit.supplier}</span>
                </div>

                <div className="car-image-wrapper">
                  <picture>
                    <source srcSet={car.imageAvif} type="image/avif" />
                    <img
                      src={car.imagePng}
                      alt={`${car.teamName} ${car.chassis}`}
                      className="car-image"
                      loading="lazy"
                    />
                  </picture>
                </div>

                <div className="car-quick-specs">
                  <div className="car-spec-item">
                    <span className="car-spec-label">Power Unit</span>
                    <span className="car-spec-val">{car.powerUnit.name}</span>
                  </div>
                  <div className="car-spec-item">
                    <span className="car-spec-label">Output</span>
                    <span className="car-spec-val">{car.powerUnit.powerOutput}</span>
                  </div>
                  <div className="car-spec-item">
                    <span className="car-spec-label">Min Weight</span>
                    <span className="car-spec-val">{car.weight.split(' ')[0]} kg</span>
                  </div>
                </div>

                <div className="car-card-footer">
                  <div className="car-drivers-list">
                    {car.drivers.map((d) => (
                      <span key={d.code} className="car-driver-pill">
                        <strong>#{d.number}</strong> {d.name.split(' ').slice(-1)[0]}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="car-inspect-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveCar(car)
                    }}
                  >
                    Specs &rarr;
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal Dialog */}
      {activeCar && (
        <div className="modal-backdrop" onClick={() => setActiveCar(null)}>
          <div
            className="modal-content car-modal"
            style={{ borderTop: `4px solid ${getTeamColor(activeCar.constructorId)}` }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="car-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow" style={{ color: getTeamColor(activeCar.constructorId) }}>
                  {activeCar.teamName} &middot; {activeCar.season}
                </span>
                <h2 id="car-modal-title" className="modal-title">
                  {activeCar.chassis} Technical Specifications
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveCar(null)}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="car-modal-body">
              <div className="car-modal-hero">
                <picture>
                  <source srcSet={activeCar.imageAvif} type="image/avif" />
                  <img
                    src={activeCar.imagePng}
                    alt={`${activeCar.teamName} ${activeCar.chassis}`}
                    className="car-modal-image"
                  />
                </picture>
              </div>

              <p className="car-modal-desc">{activeCar.description}</p>

              <div className="car-specs-grid">
                <div className="car-specs-card">
                  <h4 className="car-specs-heading">Power Unit &amp; Energy</h4>
                  <dl className="car-specs-dl">
                    <dt>Supplier</dt>
                    <dd>{activeCar.powerUnit.supplier}</dd>
                    <dt>Designation</dt>
                    <dd>{activeCar.powerUnit.name}</dd>
                    <dt>Configuration</dt>
                    <dd>{activeCar.powerUnit.configuration}</dd>
                    <dt>Max RPM</dt>
                    <dd className="stat-value-inline">{activeCar.powerUnit.maxRpm}</dd>
                    <dt>Max Power</dt>
                    <dd className="stat-value-inline">{activeCar.powerUnit.powerOutput}</dd>
                    <dt>Hybrid ERS</dt>
                    <dd>{activeCar.powerUnit.mguConfig}</dd>
                  </dl>
                </div>

                <div className="car-specs-card">
                  <h4 className="car-specs-heading">Chassis &amp; Mechanicals</h4>
                  <dl className="car-specs-dl">
                    <dt>Transmission</dt>
                    <dd>{activeCar.transmission}</dd>
                    <dt>Dry Weight</dt>
                    <dd className="stat-value-inline">{activeCar.weight}</dd>
                    <dt>Fuel Load</dt>
                    <dd>{activeCar.fuelCapacity}</dd>
                    <dt>Braking System</dt>
                    <dd>{activeCar.brakes}</dd>
                    <dt>Suspension</dt>
                    <dd>{activeCar.suspension}</dd>
                  </dl>
                </div>
              </div>

              <div className="car-innovations-card">
                <h4 className="car-specs-heading">Key Aerodynamic &amp; Engineering Highlights</h4>
                <ul className="car-innovations-list">
                  {activeCar.keyInnovations.map((item, i) => (
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
