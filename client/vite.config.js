import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()],

    optimizeDeps: {
    exclude: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
    include: ['prop-types']
  }
  
})
