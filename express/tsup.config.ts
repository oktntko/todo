import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  tsconfig: './tsconfig.node.json',
  format: 'esm',
  target: 'node22',
});
