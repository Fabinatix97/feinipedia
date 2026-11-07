import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['dog-face.png'],
      manifest: {
        name: 'Feinipedia – Dein Hundewissensbuch',
        short_name: 'Feinipedia',
        description: 'Wissen rund um deinen Hund sammeln und behalten.',
        lang: 'de',
        theme_color: '#fbf8f4',
        background_color: '#fbf8f4',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:3001' } },
})
