import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

import tailwindcss from '@tailwindcss/vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import Unfonts from 'unplugin-fonts/vite';
import VueRouter from 'unplugin-vue-router/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: `${process.env['MODE'] === 'msw' ? '/todo' : ''}/`, // for GitHub Pages
  plugins: [
    VueRouter({
      extensions: ['.vue', '.tsx'],
      routesFolder: 'src/page',
      exclude: ['**/component', '**/modal'],
      dts: 'src/vue-router.d.ts',
    }),
    Vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['selectedcontent'].includes(tag),
        },
      },
    }),
    VueJsx(),
    Unfonts({
      // https://fontsource.org/
      fontsource: {
        families: ['Noto Sans JP Variable', 'M PLUS 1 Code Variable'],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env['EXPRESS_PORT'] || 8080}`,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**'],
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
    reporters: ['default', 'html'],
    outputFile: {
      html: '.report/html/index.html',
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      include: ['src/**'],
      exclude: ['**/*.d.ts'],
      reportsDirectory: '.report/coverage',
    },
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
});
