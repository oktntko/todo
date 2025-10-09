import { PGlite } from '@electric-sql/pglite';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { drizzle as pglite } from 'drizzle-orm/pglite';
import migrations from './migrations.json';
import { schema } from './schema';

const DB_NAME = import.meta.env.PROD ? 'github-oktntko-todo' : 'github-oktntko-todo-dev';
const client = new PGlite(`idb://${DB_NAME}`);

export const drizzle = pglite({
  client,
  logger: import.meta.env.DEV,
  schema,
});

export async function migrate() {
  // https://github.com/drizzle-team/drizzle-orm/discussions/2532
  // @ts-expect-error 🤷 dialect and session will appear to not exist...but they do
  await drizzle.dialect.migrate(migrations, drizzle.session, {
    migrationsTable: 'drizzle_migrations',
  } satisfies Omit<MigrationConfig, 'migrationsFolder'>);

  return { sync: true };
}
