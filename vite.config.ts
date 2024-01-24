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
    coverage: {
      exclude: [
        '**/src/App.vue',
        '**/src/main.ts',
        '**/src/vocabularies.ts',
        '**/*.d.ts',
        '**/postcss.config.js',
      ],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
