import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/server/index.ts'],
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  tsconfig: './tsconfig.server.json',
  format: 'esm',
  target: 'node26',
  dts: false,
});
