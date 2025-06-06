import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests
      '/api': {
        target: 'http://localhost:5208', // Your C# backend URL
        changeOrigin: true, // Recommended for most cases
        // secure: false, // Uncomment if your backend is HTTPS with a self-signed certificate
        // rewrite: (path) => path.replace(/^\/api/, '') // Usually not needed if your backend endpoints already start with /api
      }
    }
  }
})