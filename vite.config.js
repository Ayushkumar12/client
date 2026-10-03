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
        target: 'https://5nbb03kw-5000.inc1.devtunnels.ms/',
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: 'https://5nbb03kw-5000.inc1.devtunnels.ms/',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'https://5nbb03kw-5000.inc1.devtunnels.ms/',
        changeOrigin: true,
      }
    }
  }
})
