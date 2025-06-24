// cea-hub/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- ADD THIS SECTION TO CONFIGURE THE PROXY ---
  server: {
    proxy: {
      // Any request starting with /api will be forwarded
      '/api': {
        // Forward it to your backend server.
        // Make sure this port matches the one your backend is running on.
        target: 'http://localhost:3000', 
        changeOrigin: true, // This is usually needed
      },
    },
  },
  // ---------------------------------------------
})