import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import { Dashboard } from './pages/Dashboard'
import { Drivers } from './pages/Drivers'
import { RaceDetail } from './pages/RaceDetail'
import { Races } from './pages/Races'
import { Standings } from './pages/Standings'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <strong>APEX</strong>
          <span>F1 Analytics</span>
        </div>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/standings">Standings</NavLink>
          <NavLink to="/races">Races</NavLink>
          <NavLink to="/drivers">Drivers</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/races" element={<Races />} />
          <Route path="/races/:round" element={<RaceDetail />} />
          <Route path="/drivers" element={<Drivers />} />
        </Routes>
      </main>

      <footer className="app-footer">Apex F1 Analytics Dashboard</footer>
    </div>
  )
}

export default App
