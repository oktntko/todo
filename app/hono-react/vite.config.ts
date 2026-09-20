import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: 'src/client/page',
      generatedRouteTree: 'src/client/routeTree.gen.ts',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    outDir: 'dist/client',
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ['jotai'],
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
