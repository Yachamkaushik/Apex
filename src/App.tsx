import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import { SeasonSelect } from './components/SeasonSelect'
import { ThemeToggle } from './components/ThemeToggle'
import { ConstructorDetail } from './pages/ConstructorDetail'
import { Dashboard } from './pages/Dashboard'
import { DriverDetail } from './pages/DriverDetail'
import { Drivers } from './pages/Drivers'
import { RaceDetail } from './pages/RaceDetail'
import { Races } from './pages/Races'
import { Standings } from './pages/Standings'

function App() {
  return (
    <div className="app">
      <div className="checker-strip" aria-hidden="true" />
      <header className="app-header">
        <div className="logo">
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
          </nav>
          <div className="header-controls">
            <SeasonSelect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/constructors/:constructorId" element={<ConstructorDetail />} />
          <Route path="/races" element={<Races />} />
          <Route path="/races/:round" element={<RaceDetail />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/drivers/:driverId" element={<DriverDetail />} />
        </Routes>
      </main>

      <footer className="app-footer">Apex F1 Analytics Dashboard</footer>
    </div>
  )
}

export default App
