import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Build timestamp for version tracking
const BUILD_VERSION = new Date().toISOString();

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        share: 'share.html',
        offline: 'offline.html',
        ai_setup: 'ai-setup.html',
        automations: 'automations.html'
      }
    }
  },
  define: {
    '__BUILD_VERSION__': JSON.stringify(BUILD_VERSION),
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Commander',
        short_name: 'Commander',
        description: 'Titan Prompt Commander - Your daily execution cockpit',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        share_target: {
          action: './share.html',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        shortcuts: [
          {
            name: 'New Task',
            short_name: 'New',
            description: 'Add a new task to Inbox',
            url: './?focus=new&autofocus=1',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Ship Mode',
            short_name: 'Ship',
            description: 'View Ship Today tasks',
            url: './?view=shipToday',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Quick Capture',
            short_name: 'Capture',
            description: 'Open capture view',
            url: './?view=capture&autofocus=1',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: './offline.html',
        // Don't redirect share.html to offline - it needs its query params
        navigateFallbackDenylist: [/^\/api/, /\.(json|xml|txt)$/, /share\.html/],
        // Ignore all URL parameters when matching precached files (fixes offline deep linking)
        ignoreURLParametersMatching: [/.*/],
        runtimeCaching: [
          {
            // Handle share.html requests with NetworkFirst for reliability
            urlPattern: ({ url }) => url.pathname.includes('share.html'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'share-target-cache',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              },
              matchOptions: {
                ignoreSearch: true
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
