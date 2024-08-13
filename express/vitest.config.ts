import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      t: fileURLToPath(new URL('./test', import.meta.url)),
    },
    reporters: ['default', 'html'],
    coverage: {
      provider: 'v8',
      enabled: true,
      include: ['src/**'],
      exclude: ['src/schema/zod/**', '**/*.d.ts'],
    },
  },
});
