
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Il base deve corrispondere esattamente al nome del repository su GitHub
  base: '/arvaia-raccolta/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
