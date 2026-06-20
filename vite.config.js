import { defineConfig } from 'vite';

// Served at the root of pong-in-a-favicon.franzai.com (Cloudflare Pages).
export default defineConfig({
  base: '/',
  build: {
    target: 'es2020', // transpiled down for Chrome, Edge and Safari
    outDir: 'dist',
  },
});
