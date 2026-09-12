import generouted from '@generouted/react-router/plugin';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    generouted({
      pagesDir: 'src/client/page/',
      output: 'src/client/router.ts',
    }),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    outDir: 'dist/client',
  },
  resolve: {
    tsconfigPaths: true,
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
