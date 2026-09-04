import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import { RouteLoadingBar } from './components/RouteLoadingBar'
import { SeasonSelect } from './components/SeasonSelect'
import { ThemeToggle } from './components/ThemeToggle'

const Cars = lazy(() => import('./pages/Cars').then((m) => ({ default: m.Cars })))
const Compare = lazy(() => import('./pages/Compare').then((m) => ({ default: m.Compare })))
const ConstructorDetail = lazy(() => import('./pages/ConstructorDetail').then((m) => ({ default: m.ConstructorDetail })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const DriverDetail = lazy(() => import('./pages/DriverDetail').then((m) => ({ default: m.DriverDetail })))
const Drivers = lazy(() => import('./pages/Drivers').then((m) => ({ default: m.Drivers })))
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })))
const RaceDetail = lazy(() => import('./pages/RaceDetail').then((m) => ({ default: m.RaceDetail })))
const Races = lazy(() => import('./pages/Races').then((m) => ({ default: m.Races })))
const Standings = lazy(() => import('./pages/Standings').then((m) => ({ default: m.Standings })))

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <svg className="brand-mark" width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="3" fill="#e10600" />
            <path
              d="M6 22 L14 10 H19 L23 22 H19.2 L18.1 18.8 H14.6 L13.4 22 Z M15.6 15.9 H17.1 L16.35 13.4 Z"
              fill="#fff"
            />
          </svg>
          <strong>APEX</strong>
          <span>F1 Analytics</span>
        </div>
        <div className="header-right">
          <nav>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/standings">Standings</NavLink>
            <NavLink to="/races">Races</NavLink>
            <NavLink to="/drivers">Drivers</NavLink>
            <NavLink to="/cars">Cars</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/insights">Insights</NavLink>
          </nav>
          <div className="header-controls">
            <SeasonSelect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="app-main">
        <Suspense fallback={<RouteLoadingBar />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/constructors/:constructorId" element={<ConstructorDetail />} />
            <Route path="/races" element={<Races />} />
            <Route path="/races/:round" element={<RaceDetail />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/drivers/:driverId" element={<DriverDetail />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="app-footer">Apex F1 Analytics Dashboard</footer>
    </div>
  )
}

export default App
