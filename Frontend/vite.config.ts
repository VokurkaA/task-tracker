import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Needed for Docker container mapping
    port: 3000,  // Matches the requirement
    watch: {
      usePolling: true // Often needed for Docker volumes on Windows/Mac
    }
  }
})