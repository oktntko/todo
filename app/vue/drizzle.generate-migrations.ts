import { readMigrationFiles } from 'drizzle-orm/migrator';
import fs from 'node:fs';

const migrations = readMigrationFiles({ migrationsFolder: './drizzle/' });

fs.writeFileSync('./src/mock/migrations.json', JSON.stringify(migrations));

console.log('Migrations compiled!');
