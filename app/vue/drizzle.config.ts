import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/mock/schema.ts',
  dialect: 'postgresql',
});
