import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './app/express/vitest.config.ts',
      './app/vue/vite.config.ts',
      './common/lib/vitest.config.ts',
    ],
  },
});
