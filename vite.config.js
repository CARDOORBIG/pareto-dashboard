import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/core/api': {
        target: 'http://10.190.0.184:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
