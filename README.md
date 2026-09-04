# Apex

An F1 analytics dashboard, built with React + TypeScript (Vite). Live data on standings, races, and drivers back to 1950, plus a set of deeper analytics — head-to-head driver comparisons, reliability, race pace, and pit stops.

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
- **Season selector** — browse any season back to 1950, not just the current one
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

## Deployment

Deployed on [Vercel](https://vercel.com) — pushes to `main` build and deploy automatically. Framework preset: Vite.
