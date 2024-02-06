/// <reference types="vitest" />

import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' },
    }),
  ],
  optimizeDeps: {
    exclude: ['vuetify'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  resolve: {
    extensions: ['.js', '.json', '.vue', '.less', '.scss', '.ts'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    manifest: true,
  },
  test: {
    globals: true,
    environmentMatchGlobs: [['src/components/**', 'jsdom']],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    environment: 'jsdom',
    coverage: {
      exclude: [
        '**/src/**/*.vue',
        '!**/src/components/base/Footer.vue',
        '**/src/plugins/**',
        '**/src/router/**',
        '**/src/store/**',
        '**/src/types/**',
        '**/src/config/**',
        '**/src/services/api.ts',
        '**/src/services/apiMethods.ts',
        '**/src/utils/mdi-icons.ts',
        '**/src/utils/materialColors.ts',
        '**/src/utils/test/**',
        '**/src/App.vue',
        '**/src/main.ts',
        '**/src/vocabularies.ts',
        '**/*.d.ts',
        '**/postcss.config.js',
      ],
      // include: ['**/src/components/base/Footer.vue'],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
