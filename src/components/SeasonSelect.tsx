import { useSeason } from '../context/SeasonContext'

export function SeasonSelect() {
  const { season, setSeason, options } = useSeason()

  return (
    <select
      className="season-select"
      aria-label="Select season"
      value={String(season)}
      onChange={(e) => {
        const raw = e.target.value
        setSeason(raw === 'current' ? 'current' : Number(raw))
      }}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
