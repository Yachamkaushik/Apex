// Approximate 2026-season livery colors, keyed by Jolpica/Ergast constructorId.
// Used purely as UI accents — not an authoritative brand reference.
const TEAM_COLORS: Record<string, string> = {
  mercedes: '#00d7b6',
  ferrari: '#e8002d',
  mclaren: '#ff8000',
  red_bull: '#3671c6',
  rb: '#6692ff',
  alpine: '#0093cc',
  haas: '#b6babd',
  audi: '#bb0a30',
  williams: '#64c4ff',
  aston_martin: '#229971',
  cadillac: '#c6a664',
}

const FALLBACK_COLOR = '#7a7a85'

export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId] ?? FALLBACK_COLOR
}
