import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  optimizeDeps: {
    exclude: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
    include: ['prop-types']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-core';
            }
            if (id.includes('react-toastify')) {
              return 'vendor-toastify';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor-deps';
          }
        }
      }
    }
  }
})