import { getTeamColor } from '../lib/teamColors'

export function TeamDot({ constructorId }: { constructorId: string }) {
  return (
    <span
      className="team-dot"
      style={{ background: getTeamColor(constructorId) }}
      aria-hidden="true"
    />
  )
}
