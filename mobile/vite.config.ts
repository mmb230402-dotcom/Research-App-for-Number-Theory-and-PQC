import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets the same build serve from a sub-path, e.g. GitHub Pages:
//   BASE_PATH=/Research-App-for-Number-Theory-and-PQC/ npm run build
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered from src/lib/pwa.ts so failures stay silent
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'Arithmos · Number Theory & PQC',
        short_name: 'Arithmos',
        description:
          'Research companion for number theory and post-quantum cryptography: domains, arXiv feed, LaTeX notes, qualifying-exam prep and an offline AI scholar.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121212',
        theme_color: '#121212',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // KaTeX ships woff2, woff and ttf; every target browser reads woff2, so only those are precached.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ],
  build: {
    target: ['es2022', 'safari16', 'chrome110'],
    chunkSizeWarningLimit: 900
  }
});
