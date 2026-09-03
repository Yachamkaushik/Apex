import type { ReactNode } from 'react'

interface AsyncBoundaryProps {
  status: 'loading' | 'error' | 'success'
  error: string | null
  /** Rendered in place of the plain "Loading…" text while status is 'loading'. */
  skeleton?: ReactNode
  children: ReactNode
}

/** Renders a loading/error state, or `children` once data has loaded successfully. */
export function AsyncBoundary({ status, error, skeleton, children }: AsyncBoundaryProps) {
  if (status === 'loading') {
    return skeleton ?? <div className="status-block">Loading…</div>
  }

  if (status === 'error') {
    return <div className="status-block status-error">Couldn't load data{error ? `: ${error}` : ''}</div>
  }

  return <>{children}</>
}
