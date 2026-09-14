import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same `dist/` works on Vercel, Netlify, GitHub Pages and
// any static host that serves it from a subdirectory.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Keep the initial payload small: React in its own chunk so the
        // browser can cache it across deploys of your content.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
