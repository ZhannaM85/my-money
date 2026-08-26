/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'test'
      ? []
      : [
          VitePWA({
            manifest: false,
            registerType: 'autoUpdate',
            injectRegister: false,
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
              globIgnores: ['version.json'],
              navigateFallback: 'index.html',
              cleanupOutdatedCaches: true,
            },
          }),
        ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    // Playwright specs live under e2e/; vitest must not load them (#118).
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.GITHUB_SHA ?? 'dev'),
  },
}))
