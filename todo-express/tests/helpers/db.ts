import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const excludes = ["_prisma_migrations", "sessions", "users"];

export const showTables = async () => {
  return client
    .$queryRawUnsafe<{ Tables_in_unit_test: string }[]>(`SHOW tables;`)
    .then((table_names) => table_names.map(({ Tables_in_unit_test: table_name }) => table_name));
};

export const setForeignKeyChecks = (onoff: 1 | 0 = 0) => {
  return client.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS=${onoff};`);
};

export const truncateTable = (table_name: string) => {
  return client.$executeRawUnsafe(`TRUNCATE TABLE ${table_name}`);
};

export const resetDB = async () => {
  const allTable = await showTables();
  const table_names = allTable.filter((table_name) => excludes.indexOf(table_name) < 0);

  await client.$transaction([
    setForeignKeyChecks(0),
    ...table_names.map(truncateTable),
    setForeignKeyChecks(1),
  ]);
};

export default {
  resetDB,
  setForeignKeyChecks,
  showTables,
  truncateTable,
};
