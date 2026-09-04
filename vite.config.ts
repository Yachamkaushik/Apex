import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Recharts (and its d3 dependencies) is the single biggest chunk
        // and is used by nearly every page — put it in its own vendor
        // chunk so it's fetched once and cached across route changes,
        // rather than duplicated into (or re-fetched with) each page.
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'recharts'
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react')) return 'vendor'
        },
      },
    },
  },
})
