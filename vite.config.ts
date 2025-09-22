import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/victory-realty/',
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: { target: 'es2020' },
  },
  server: {
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
});
