import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const isMobileApp = process.env.CAPACITOR_PLATFORM === 'android' || process.env.CAPACITOR_PLATFORM === 'ios';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // PWA только для веб-версии
    ...(!isMobileApp ? [
      VitePWA({
        registerType: 'prompt',
        manifest: {
          name: 'FitTracker',
          short_name: 'FitTracker',
          description: 'Track your fitness progress',
          theme_color: '#4CAF50',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/FitTracker/',
          scope: '/FitTracker/',
          icons: [
            {
              src: '/FitTracker/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/FitTracker/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/FitTracker/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          screenshots: [
            {
              src: '/FitTracker/screenshot-desktop.png',
              sizes: '1920x1080',
              type: 'image/png',
              form_factor: 'wide'
            },
            {
              src: '/FitTracker/screenshot-mobile.png',
              sizes: '750x1334',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg']
      })
    ] : [])
  ],
  base: '/FitTracker/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
