import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SeasonProvider } from './context/SeasonContext'
import { ThemeProvider } from './context/ThemeContext'
import '@fontsource/archivo-black/400.css'
import '@fontsource/barlow-condensed/400.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SeasonProvider>
          <App />
        </SeasonProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
