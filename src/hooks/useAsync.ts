import { useEffect, useState } from 'react'

type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: string }
  | { status: 'success'; data: T; error: null }

/** Runs `fetcher` on mount (and whenever `deps` change), tracking loading/error/data state. */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', data: null, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setState({ status: 'error', data: null, error: message })
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
