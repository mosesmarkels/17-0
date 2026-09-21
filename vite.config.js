import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from /<repo>/, so production builds need that
// base path or every asset 404s. Dev still runs from the root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/17-0/' : '/',
  server: { port: 5180 },
}))
