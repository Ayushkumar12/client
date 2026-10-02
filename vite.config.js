import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.0.143:5000',
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: 'http://192.168.0.143:5000',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'http://192.168.0.143:5000',
        changeOrigin: true,
      }
    }
  }
})
