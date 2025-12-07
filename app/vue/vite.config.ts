import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

import tailwindcss from '@tailwindcss/vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Unfonts from 'unplugin-fonts/vite';
import { VueUseComponentsResolver } from 'unplugin-vue-components/resolvers';
import VueComponents from 'unplugin-vue-components/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import VueRouter from 'unplugin-vue-router/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: `${process.env['MODE'] === 'msw' ? '/todo' : ''}/`, // for GitHub Pages
  plugins: [
    VueRouter({
      extensions: ['.vue'],
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
      // https://fonts.google.com/
      google: {
        // cSpell:ignore Noto Murecho
        families: ['Noto Sans JP', 'M PLUS 1', 'M PLUS 2', 'Murecho', 'M PLUS 1 Code'],
      },
    }),
    AutoImport({
      imports: ['vue', VueRouterAutoImports, 'pinia', '@vueuse/core'],
      vueTemplate: true,
      dts: 'src/vue-auto-import.d.ts',
    }),
    VueComponents({
      dirs: ['src/component', 'src/plugin/component'],
      extensions: ['vue', 'tsx'],
      resolvers: [VueUseComponentsResolver()],
      dts: 'src/vue-components.d.ts',
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
