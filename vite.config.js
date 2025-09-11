import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Generate manifest for better caching
    manifest: true,
    // Ensure proper asset handling
    rollupOptions: {
      output: {
        // Ensure JavaScript files have proper extensions
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Target modern browsers for better performance
    target: 'esnext',
    // Ensure source maps for debugging
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Configure dev server
  server: {
    port: 3000,
    host: true,
    // Enable fallback for SPA routing in development
    historyApiFallback: true,
  },
  // Preview server configuration (for testing builds)
  preview: {
    port: 3000,
    host: true,
  },
})
