/** Suspense fallback shown while a lazy-loaded page chunk is fetching. */
export function RouteLoadingBar() {
  return (
    <div className="route-loading" role="status" aria-label="Loading page">
      <div className="route-loading-bar" />
    </div>
  )
}
