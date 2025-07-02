import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Unfonts from 'unplugin-fonts/vite';
import { VueUseComponentsResolver } from 'unplugin-vue-components/resolvers';
import VueComponents from 'unplugin-vue-components/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import VueRouter from 'unplugin-vue-router/vite';
import VueLayouts from 'vite-plugin-vue-layouts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      extensions: ['.vue'],
      routesFolder: 'src/page',
      exclude: ['**/component', '**/modal'],
      dts: 'src/vue-router.d.ts',
    }),
    Vue(),
    VueJsx(),
    VueLayouts({
      layoutsDirs: 'src/layout',
      pagesDirs: 'src/page',
      extensions: ['vue'],
      exclude: ['**/component', '**/modal'],
      defaultLayout: 'default',
    }),
    Unfonts({
      // https://fonts.google.com/
      google: {
        families: ['Noto Sans JP', 'M PLUS 1', 'M PLUS 2', 'Murecho', 'M PLUS 1 Code'],
      },
    }),
    AutoImport({
      imports: ['vue', VueRouterAutoImports, 'pinia', '@vueuse/core'],
      vueTemplate: true,
      dts: 'src/vue-auto-import.d.ts',
    }),
    VueComponents({
      dirs: ['src/component'],
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
});
