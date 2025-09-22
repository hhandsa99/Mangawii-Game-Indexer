import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repository name for project pages
  base: '/Mangawii-Game-Indexer/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})



