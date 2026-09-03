import type { CSSProperties } from 'react'

interface BlockProps {
  height?: number | string
  width?: number | string
  style?: CSSProperties
}

export function SkeletonBlock({ height = 16, width = '100%', style }: BlockProps) {
  return <div className="skeleton" style={{ height, width, ...style }} />
}

/** A row of `.stat-card`-shaped skeletons, matching the dashboard-grid layout. */
export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="dashboard-grid" style={{ marginBottom: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat-card" key={i}>
          <SkeletonBlock height={11} width="50%" />
          <SkeletonBlock height={22} width="70%" style={{ marginTop: 4 }} />
          <SkeletonBlock height={12} width="40%" style={{ marginTop: 2 }} />
        </div>
      ))}
    </div>
  )
}

/** A `.chart-card`-shaped placeholder. */
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="chart-card">
      <SkeletonBlock height={12} width={160} style={{ marginBottom: 12 }} />
      <SkeletonBlock height={height} />
    </div>
  )
}

/** A handful of shrinking-width bars, standing in for table rows. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="skeleton-stack">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} height={18} width={`${92 - (i % 4) * 6}%`} />
      ))}
    </div>
  )
}

/** A `.driver-card`-shaped grid, standing in for the drivers/podium grids. */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="driver-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="driver-card" key={i} style={{ borderLeftColor: 'var(--border)' }}>
          <SkeletonBlock height={44} width={44} style={{ borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <SkeletonBlock height={15} width="70%" />
            <SkeletonBlock height={12} width="45%" style={{ marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
