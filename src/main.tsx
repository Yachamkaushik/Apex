import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SeasonProvider } from './context/SeasonContext'
import { ThemeProvider } from './context/ThemeContext'
import '@fontsource/titillium-web/400.css'
import '@fontsource/titillium-web/600.css'
import '@fontsource/titillium-web/700.css'
import '@fontsource/titillium-web/900.css'
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
