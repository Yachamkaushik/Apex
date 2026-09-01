import type { ReactNode } from 'react'

interface AsyncBoundaryProps {
  status: 'loading' | 'error' | 'success'
  error: string | null
  children: ReactNode
}

/** Renders a loading/error state, or `children` once data has loaded successfully. */
export function AsyncBoundary({ status, error, children }: AsyncBoundaryProps) {
  if (status === 'loading') {
    return <div className="status-block">Loading…</div>
  }

  if (status === 'error') {
    return <div className="status-block status-error">Couldn't load data{error ? `: ${error}` : ''}</div>
  }

  return <>{children}</>
}
