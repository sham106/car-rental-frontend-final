import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), VitePWA({
      registerType: 'prompt',
      injectRegister: 'script',
      includeAssets: ['icons/*.png', 'offline.html'],
      manifest: {
        id: '/', name: 'DailyCar & Fleet Operations', short_name: 'DailyCar',
        description: 'Car rentals and fleet operations on the go.',
        start_url: '/', scope: '/', display: 'standalone',
        theme_color: '#17324D', background_color: '#F8F6F1',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [{ name: 'Admin dashboard', url: '/admin', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }] }],
      },
      workbox: {
        // Only static build assets are stored. API responses and private files stay online-only.
        globPatterns: ['**/*.{js,css,png,svg,ico}', 'offline.html'],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        runtimeCaching: [{
          urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api/'),
          handler: 'NetworkOnly',
          options: { precacheFallback: { fallbackURL: '/offline.html' } },
        }],
      },
    })],
    preview: {
      proxy: { '/api': { target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true } },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: { '/api': { target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true } },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
