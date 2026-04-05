import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  define: {
    // Hardcode fallback in case env var isn't picked up
    '__API_URL__': JSON.stringify(process.env.VITE_API_URL || 'https://trackflow-production-22cc.up.railway.app'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mapbox: ['mapbox-gl'],
          charts: ['recharts'],
        },
      },
    },
  },
});