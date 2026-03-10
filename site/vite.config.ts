import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',') ?? []

export default defineConfig({
  plugins: [react()],
  server: {
    port: 56741,
    host: true,
    allowedHosts,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
