import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <strong>APEX</strong>
          <span>F1 Analytics</span>
        </div>
        <nav>
          <a className="active" href="#">
            Dashboard
          </a>
          <a href="#">Standings</a>
          <a href="#">Races</a>
          <a href="#">Drivers</a>
        </nav>
      </header>

      <main className="app-main">
        <div className="placeholder">
          <h1>Apex is warming up</h1>
          <p>The dashboard shell is in place — race data and charts land next.</p>
        </div>
      </main>

      <footer className="app-footer">Apex F1 Analytics Dashboard</footer>
    </div>
  )
}

export default App
