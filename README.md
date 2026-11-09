# Apex — An F1 Analytics Dashboard

Apex is a web-based dashboard for Formula 1 data: live standings, race schedules and results, driver and constructor profiles, head-to-head driver comparisons, and season-wide analytics such as reliability, race pace and pit-stop performance. It covers every season from 2011 onward, not just the current one.

- **Live app:** deployed on Vercel (auto-deploys on every push to `main`)
- **Repo:** https://github.com/Yachamkaushik/Apex
- **Stack:** React 19 + TypeScript + Vite (Rolldown) + Recharts, served by nginx in a Docker container, backed by the [Jolpica F1 API](https://api.jolpi.ca)

This README also documents how the project is taken through the **8 phases of the DevOps lifecycle**, plus the Jenkins CI job that sits alongside them.

---

## Features

- **Dashboard** — championship leader, constructor leader, next race, season progress, last race podium
- **Standings** — driver and constructor championship tables
- **Races** — season schedule and results
- **Drivers / Cars / Circuits** — profile pages
- **Compare** — head-to-head driver comparison
- **Insights** — Reliability, Pace, and Pit Stops tabs
- Season selector (2011 → present), light/dark theme

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite (Rolldown) |
| Charts | Recharts |
| Routing | react-router-dom |
| Data source | Jolpica F1 API (successor to the deprecated Ergast API) |
| Container runtime | nginx (unprivileged, Alpine) |
| CI | Jenkins |
| Testing | Selenium WebDriver + pytest |

There is **no backend service and no database** — nginx itself proxies and caches live data from the Jolpica F1 API, so the app always shows current data without the team running a data service of its own.

---

## Project Structure

```
Apex/
├── src/
│   ├── api/f1.ts          # Jolpica F1 API client
│   ├── lib/                # pure data-processing helpers
│   ├── context/             # SeasonContext, ThemeContext
│   └── pages/               # Dashboard, Standings, Races, Drivers, Cars, Circuits, Compare, Insights
├── Dockerfile                # multi-stage build → nginx runtime
├── nginx.conf.template       # routing, /api/f1 proxy, caching, SPA fallback
├── docker-compose.yml        # single `apex` service
├── Jenkinsfile                # CI pipeline definition
├── tests/selenium/            # Selenium/pytest UI test suite
└── README.md
```

---

## Running Locally

```bash
npm ci
npm run dev        # Vite dev server
npm run build       # tsc -b && vite build
npm run lint         # oxlint
npm run preview       # preview the production build
```

## Running with Docker

```bash
git clone https://github.com/Yachamkaushik/Apex.git
cd Apex
docker compose up -d
```

The app is then available at **http://localhost:8081**.

```bash
docker compose ps        # check status / health
docker compose logs -f     # follow nginx logs
curl http://localhost:8081/healthz   # → "ok"
docker compose down         # stop and remove
```

---

## The DevOps Lifecycle, as Implemented in Apex

### 1. Plan
We started by scoping what Apex would actually be — a frontend-only F1 dashboard with no backend of its own, pulling live data from a public API instead of maintaining our own dataset — and then mapped the work onto the eight DevOps phases so each teammate's piece had a clear place in the pipeline. The work was split roughly into four stages: (1) build the dashboard and its pages, (2) containerize the app with Docker and Docker Compose, (3) write a Selenium suite and get it running against the deployed container, (4) set up Jenkins for CI and finish the documentation. Deciding early that nginx itself would proxy and cache the API, instead of writing a small backend service, simplified everything downstream — there was no database to provision, migrate, or operate.

### 2. Code
Git is the version control system and GitHub the remote host, using a **feature-branch workflow**:

1. `git checkout -b feature/your-feature`
2. Develop, `git add .`, commit with a clear message
3. `git push -u origin feature/your-feature`
4. Open a pull request on GitHub and go through code review
5. Get it approved
6. Merge into `main` — after which Jenkins picks up the change

In practice we worked almost entirely on feature branches — `feature/dockerize`, `feature/docker-port-8081`, `feature/tooltip-fixes-jenkins`, among others — rather than committing straight to `main`. **PR #10** (`feature/docker-port-8081`) moved the container from port 8080 to the host's 8081 and was reviewed and merged by the repo owner; **PR #11** added the entire `tests/selenium` suite plus a small follow-up fix, merged on 2 Nov 2026. That history is also why `main` is effectively protected — nothing landed there without going through a pull request and a review first.

### 3. Build
A two-stage **Dockerfile** builds a single, non-root image:

- **Build stage** — a throwaway `node:24-alpine` stage runs `npm ci` and `npm run build` (type-check + Vite production build). Only the resulting `dist/` is carried forward, so the final image has no Node.js, `node_modules`, or source code.
- **Runtime stage** — `nginxinc/nginx-unprivileged:stable-alpine` serves the built files on port 8080, running as a non-root user.
- A Docker **HEALTHCHECK** polls `GET /healthz` every 30 seconds, so `docker ps` reports the container healthy/unhealthy with no extra tooling.

Dependencies are installed before application code is copied in, so Docker's layer cache keeps rebuilds fast when only source files change.

We deliberately wrote this as a *multi-stage* Dockerfile rather than a single stage, specifically so the shipped image wouldn't carry a Node toolchain, `node_modules`, or any source code — only the compiled static `dist/` output. Switching the runtime base to `nginxinc/nginx-unprivileged` (instead of plain `nginx`) was also a deliberate choice: that image already runs as a non-root user and listens on 8080 instead of 80, so the container doesn't need root to bind its port — one less thing to worry about security-wise. The `HEALTHCHECK` against `/healthz` was added so Docker itself — not just the app — can tell whether the container is actually serving traffic.

### 4. Test
Selenium WebDriver (Python) drives the app through a real browser against the deployed container at `http://localhost:8081`:

```bash
pip install -r tests/selenium/requirements.txt
docker compose up -d
pytest tests/selenium -v
```

13 test items run in total: `test_page_loads_directly` is parametrized across all 8 routes (8 results), plus `test_nav_links_navigate_to_each_page`, `test_footer_present_on_every_page`, `test_season_selector_has_options_and_is_changeable`, `test_theme_toggle_switches_theme`, and `test_logo_links_back_to_dashboard`. Tests deliberately avoid asserting on exact live data values — only that real content renders — since the app pulls live F1 data on every run.

On a real run against the deployed container, 12 of the 13 items passed; `test_nav_links_navigate_to_each_page` failed with a `TimeoutException`. That test clicks through each header nav link in turn and waits for the page to change — on that run, the wait was too tight for one of the later links, which briefly re-renders while live F1 data is still loading through the `/api/f1` proxy. We left it as a known, tracked issue rather than silently widening the wait and moving on, because it's a genuine example of what automated testing is supposed to surface: a timing assumption that doesn't always hold. The documented fix is to widen that specific wait and re-scope the locator to the header nav bar.

### 5. Release
A change becomes a release once it's merged into `main`, the build succeeds, and tests pass — the image is tagged `apex:latest`. We didn't set up a dedicated release/tagging step beyond this for the lab project; "released" here practically means "on `main`, built, and reachable." Proposed next step: adopt semantic versioning (`MAJOR.MINOR.PATCH`) with versioned images pushed to a registry, so rollback is just deploying the previous tag instead of rebuilding from a specific commit.

### 6. Deploy
```bash
git clone https://github.com/Yachamkaushik/Apex.git
cd Apex
docker compose up -d
```

`docker-compose.yml` defines a single `apex` service, built from the project's Dockerfile, published on host port **8081** → container port 8080, tagged `apex:latest`, with `restart: unless-stopped` so it recovers automatically after a host reboot. The app also auto-deploys to **Vercel** on every push to `main`, giving a second, independent delivery path.

We actually ended up with two deployment surfaces for different reasons: Vercel handles the "always-on public URL" case automatically and needed no configuration beyond connecting the repo, while the Docker/Compose path exists so the app can be deployed and graded on any machine with Docker — which is the setup the Selenium tests and this report assume. The port was moved from 8080 to 8081 on the host (PR #10) specifically to avoid clashing with other services already using 8080 locally, while the container itself still listens on 8080 internally.

### 7. Operate
Day-to-day operation uses a small set of Compose commands:

| Command | Purpose |
|---|---|
| `docker compose ps` | Shows the container and whether it's healthy |
| `docker compose logs -f` | Follows nginx access/error output |
| `docker compose restart` | Restarts the service |
| `docker compose stop` | Stops the service, keeps the container |
| `docker compose up -d` | Starts the service |
| `docker compose down` | Removes the container and network |

Apex is stateless — no database, no user accounts — so operations is mainly: is the container healthy, is `/api/f1` reachable, and is the upstream cache behaving. Because there's no state to back up or migrate, "operating" Apex day-to-day is lighter than a typical stateful service — restarting or redeploying never risks losing data, since nothing persists in the container in the first place.

### 8. Monitor
`docker compose ps` / the built-in `HEALTHCHECK` report container health; `docker compose logs` surfaces 4xx/5xx responses or a slow upstream. Jenkins adds a second, code-level signal — each build reports **SUCCESS** or **FAILURE** with links to the exact change and console output.

For this project, monitoring was kept deliberately simple and manual — we check `docker compose ps`/`logs` and the Jenkins build status rather than running a dedicated monitoring stack, since the app has no persistent state and a bad deploy is immediately visible as an unhealthy container or a failed build. Proposed next step: structured access logging plus Prometheus/Grafana for request-count and cache-hit-ratio metrics, with alerting when the container goes unhealthy or the upstream API degrades — this is scoped as future work rather than something implemented for the lab submission.

---

## Continuous Integration with Jenkins

A Jenkins pipeline job named **Apex** polls the repository and runs on every push to `main`:

- **Source Code Management:** Git — `https://github.com/Yachamkaushik/Apex.git`, branch `*/main`
- **Tool:** NodeJS installation (Node 20+)
- **Build trigger:** Poll SCM
- **Pipeline stages:** Checkout → `npm ci` → `npm run lint` → `npm run build` (type-check + build) — exactly as defined in the [`Jenkinsfile`](./Jenkinsfile)
- **Result:** each build reports SUCCESS or FAILURE, with links to the exact Git revision, changes, and console output; the workspace is cleaned after every run

The Jenkins job verifies code lints and builds correctly on every change — it does **not** build the Docker image, run `docker compose`, or run the Selenium suite; those remain separate steps performed on the deployment machine (see Build/Deploy/Test above). We set Jenkins up specifically to catch lint and type errors as early as possible, independently of whether anyone happened to run a local build before merging — it's the fast, code-level check, while the Docker build and Selenium tests are the slower, "does it actually run" checks done separately. Extending the Jenkins job to cover those — by giving it a Docker-enabled agent — is tracked as future work.

---

## Future Work

- Run the Docker build and Selenium tests as additional Jenkins stages (Docker-enabled agent)
- Push versioned images to a container registry instead of a floating `apex:latest` tag
- Add Prometheus/Grafana monitoring and alerting
- Pin base image digests and add image scanning (e.g. Trivy)
