import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/client/index.ts', 'src/schema/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  tsconfig: './tsconfig.base.json',
  format: 'esm',
  target: 'node24',
});
