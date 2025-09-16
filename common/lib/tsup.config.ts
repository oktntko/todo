import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/dayjs.ts', 'src/remeda.ts', 'src/zod.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  tsconfig: './tsconfig.base.json',
  format: 'esm',
  target: 'node24',
});
