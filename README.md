# Apex

An F1 analytics dashboard, built with React + TypeScript (Vite). Live data on standings, races, and drivers across the modern era (2011–present), plus a set of deeper analytics — head-to-head driver comparisons, reliability, race pace, and pit stops.

## Features

- **Dashboard** — championship leader, constructor leader, next race countdown, season progress, last-race podium, and title-fight/constructors' points charts
- **Standings** — driver and constructor championships, with a season-long points-progression chart
- **Races** — full season schedule; each race links to a detail page with results, a grid-vs-finish chart, and a qualifying-vs-race-finish comparison
- **Drivers** — the full grid with search and team filtering; each driver has a detail page with season results and a cumulative-points chart
- **Compare** — head-to-head comparison between any two drivers (shareable via URL), with a finish tally and cumulative-points chart
- **Insights** — season-wide analytics in three tabs:
  - *Reliability* — DNF causes and per-driver finish rates
  - *Pace* — each driver's gap to the fastest lap of each round, charted across the season
  - *Pit stops* — average stop duration by team and the season's fastest individual stops
- **Cars** - The f1 car carousel like none other.
- **Circuits** - The crazy F1 circuits come alive on your screen.
- **Season selector** — browse any season from 2011 onward, not just the current one (the API has data back to 1950, but 2011 is where pit-stop timing and fastest-lap data both become consistently available, so every page — not just standings — has something to show for every season on the list)
- **Light/dark theme** — toggle in the header, persisted locally

## Tech stack

- React 19 + TypeScript
- Vite (Rolldown), React Router
- Recharts for charts
- [Jolpica-F1](https://github.com/jolpica/jolpica-f1) — the community-run successor to the deprecated Ergast API — for all F1 data

## Architecture notes

- `src/api/f1.ts` — the API client. Season-wide data (results, sprints, pit stops) is paginated/batched and cached per season, since the underlying API has no single endpoint for a whole season in most cases.
- `src/lib/` — pure functions over that data: points progression, pace-gap trends, reliability/DNF stats, pit-stop aggregation. No React, no fetching — easy to test in isolation.
- `src/context/` — `SeasonContext` and `ThemeContext`, both persisted to `localStorage`.
- Pages are lazy-loaded (`React.lazy` + route-level code splitting), and Recharts is split into its own cached vendor chunk, since it's the single largest dependency and used by nearly every page.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — lint the project

## Running with Docker

The app ships as a small, self-contained image: a multi-stage build (Node builds the static bundle; nginx serves it), so you don't need Node installed to run it.

```bash
# build and run
docker build -t apex .
docker run --rm -p 8080:8080 apex

# or with Compose
docker compose up --build
```

Then open <http://localhost:8080>.

What the image does:

- **Multi-stage build** — `npm ci` + `npm run build` happen in a throwaway `node:24-alpine` stage; only the built `dist/` is copied into the final `nginx` image, so the runtime image contains no Node, no `node_modules`, and no source.
- **Non-root** — uses the `nginx-unprivileged` base image, so it listens on `8080` and runs as an unprivileged user.
- **SPA routing** — unknown paths fall back to `index.html`, so deep links and hard refreshes on routes like `/drivers/norris` work.
- **`/api/f1` proxy** — nginx proxies `/api/f1/*` to the Jolpica API and caches successful responses for 5 minutes (serving stale data if the upstream errors or rate-limits). This mirrors the dev-server proxy in `vite.config.ts`, which is why the app's client tries `/api/f1` first.
- **Caching headers** — fingerprinted files under `/assets/` are cached for a year; `index.html` is always revalidated.
- **Health check** — `GET /healthz` returns `ok`; the image declares a Docker `HEALTHCHECK` against it.

## Deployment

Deployed on [Vercel](https://vercel.com) — pushes to `main` build and deploy automatically. Framework preset: Vite.
