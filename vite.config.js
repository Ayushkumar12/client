import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_API_TARGET || 'https://5nbb03kw-5000.inc1.devtunnels.ms/'

  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/sitemap.xml': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/robots.txt': {
          target: backendTarget,
          changeOrigin: true,
        }
      }
    }
  }
})
