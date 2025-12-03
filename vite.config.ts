import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon-*.png"],
      manifest: {
        name: "Libere - Digital Library",
        short_name: "Libere",
        description: "Decentralized digital library platform on Base blockchain",
        theme_color: "#f59e0b",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,mp3}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit for audiobooks
        runtimeCaching: [
          {
            // SECURITY: EPUB files should NEVER be cached for security
            // Force network-only to prevent unauthorized offline access
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*\.epub(\?.*)?$/i,
            handler: "NetworkOnly",
            options: {
              cacheName: "epub-no-cache", // This won't actually cache anything
            },
          },
          {
            // Supabase Storage signed URLs - short cache for non-EPUB files
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*\/sign\/.*/i,
            handler: "NetworkOnly", // Signed URLs should not be cached (expire quickly)
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.pinata\.cloud\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ipfs-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/gateway\.pinata\.cloud\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ipfs-gateway-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Audiobook files - cache for offline playback
            urlPattern: /.*\.mp3$/,
            handler: "CacheFirst",
            options: {
              cacheName: "audiobook-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 604800, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA in development
      },
    }),
  ],
});
