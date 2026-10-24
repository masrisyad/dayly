/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves the app from /<repo-name>/; the deploy workflow sets VITE_BASE to that path.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
    // Set by the deploy workflow, e.g. https://github.com/<user>/<repo>
    __REPO_URL__: JSON.stringify(process.env.VITE_REPO_URL ?? ''),
  },
  plugins: [
    react(),
    VitePWA({
      // A new version waits until the user taps "Reload" (see UpdateBanner), so an update never interrupts typing.
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'illustrations/*.webp'],
      manifest: {
        name: 'Dayly',
        short_name: 'Dayly',
        description: 'A cozy daily & weekly planner. All your data stays on your device.',
        lang: 'id',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#F6EEE3',
        theme_color: '#F6EEE3',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
  },
});
