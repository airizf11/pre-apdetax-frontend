// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: ' http://localhost:2191',
        changeOrigin: true,
        secure: false, // Jika backend pakai HTTPS self-signed
      }
      
    },
    allowedHosts: ['71b8-114-10-47-29.ngrok-free.app']
  }
})