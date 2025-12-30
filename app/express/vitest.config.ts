import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
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
});
