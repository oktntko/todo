import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/schema/index.ts'],
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  tsconfig: './tsconfig.base.json',
  format: 'esm',
  target: 'node24',
  dts: false,
});
