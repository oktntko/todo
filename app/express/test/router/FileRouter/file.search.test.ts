import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createFile } from './testFileRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter`, () => {
  describe(`file.search`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          // Add user_list relation
          await tx.file.update({
            where: { file_id: file.file_id },
            data: {
              user_list: {
                connect: {
                  user_id: operator.user_id,
                },
              },
            },
          });

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: file.filename,
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output).toEqual({
            total: expect.any(Number),
            file_list: expect.any(Array),
          });
          expect(output.total).toBeGreaterThan(0);
          expect(output.file_list).toContainEqual(
            expect.objectContaining({ file_id: file.file_id }),
          );
        });
      });
      test(`success with no keyword`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          // Add user_list relation
          await tx.file.update({
            where: { file_id: file.file_id },
            data: {
              user_list: {
                connect: {
                  user_id: operator.user_id,
                },
              },
            },
          });

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: '',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output).toEqual({
            total: expect.any(Number),
            file_list: expect.any(Array),
          });
          expect(output.total).toBeGreaterThan(0);
        });
      });
      test(`success with pagination`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          // Create multiple files
          const files = await Promise.all([
            tx.file.create({
              data: {
                file_id: crypto.randomUUID(),
                filename: 'test1.txt',
                mimetype: 'text/plain',
                filesize: 1024,
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
                created_by: operator.user_id,
                updated_by: operator.user_id,
              },
            }),
            tx.file.create({
              data: {
                file_id: crypto.randomUUID(),
                filename: 'test2.txt',
                mimetype: 'text/plain',
                filesize: 1024,
                created_at: new Date(2001, 2, 4),
                updated_at: new Date(2001, 2, 4),
                created_by: operator.user_id,
                updated_by: operator.user_id,
              },
            }),
            tx.file.create({
              data: {
                file_id: crypto.randomUUID(),
                filename: 'test3.txt',
                mimetype: 'text/plain',
                filesize: 1024,
                created_at: new Date(2001, 2, 5),
                updated_at: new Date(2001, 2, 5),
                created_by: operator.user_id,
                updated_by: operator.user_id,
              },
            }),
          ]);

          // Add user_list relation for all files
          await Promise.all(
            files.map((file) =>
              tx.file.update({
                where: { file_id: file.file_id },
                data: {
                  user_list: {
                    connect: {
                      user_id: operator.user_id,
                    },
                  },
                },
              }),
            ),
          );

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: '',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 2,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output.file_list.length).toBeLessThanOrEqual(2);
        });
      });
      test(`fail. no files for user`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: 'not-exist',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output).toEqual({
            total: 0,
            file_list: [],
          });
        });
      });
    });
    describe(`test data access`, () => {
      test(`search by filename`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file1 = await createFile(tx, operator);
          const file2 = await tx.file.create({
            data: {
              file_id: crypto.randomUUID(),
              filename: 'different-name.txt',
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: operator.user_id,
              updated_by: operator.user_id,
            },
          });

          // Add user_list relation
          await Promise.all([
            tx.file.update({
              where: { file_id: file1.file_id },
              data: {
                user_list: {
                  connect: {
                    user_id: operator.user_id,
                  },
                },
              },
            }),
            tx.file.update({
              where: { file_id: file2.file_id },
              data: {
                user_list: {
                  connect: {
                    user_id: operator.user_id,
                  },
                },
              },
            }),
          ]);

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: 'test',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output.file_list.map((f) => f.file_id)).toContain(file1.file_id);
          expect(output.file_list.map((f) => f.file_id)).not.toContain(file2.file_id);
        });
      });
    });
  });
});
