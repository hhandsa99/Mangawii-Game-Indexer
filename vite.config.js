import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use repo base only for production (GitHub Pages). For dev use '/'
  base: mode === 'production' ? '/Mangawii-Game-Indexer/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}))



