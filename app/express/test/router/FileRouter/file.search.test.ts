import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { createTestUser, transactionRollbackTrpc } from '../../helper';
import { addTestFile, createTestSpaceAndAddFile } from './_FileRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.search`, () => {
  describe(`filter by space_id.`, () => {
    test.for([
      { role: 'OWNER' }, //
      { role: 'ADMIN' }, //
      { role: 'EDITOR' }, //
      { role: 'READER' }, //
    ] as const)(
      `✅ success - search files owned by the login user, when operator has $role role.`,
      async ({ role }) => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          // arrange
          const fileInSpaceA_1 = await createTestSpaceAndAddFile(tx, operator, role);
          const fileInSpaceA_2 = await addTestFile(tx, operator, fileInSpaceA_1);
          /* const fileInSpaceB = */ await createTestSpaceAndAddFile(tx, operator, role);

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            space_id: fileInSpaceA_1.space_id,
            where: {
              file_keyword: '',
            },
            sort: {
              field: 'created_at',
              order: 'asc',
            },
            limit: 10,
            page: 1,
          };

          // act
          const output = await caller.file.search(input);

          // assert
          expect(output.total).toBe(2);
          expect(output.file_list).toHaveLength(2);
          expect(output.file_list).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ file_id: fileInSpaceA_1.file_id }),
              expect.objectContaining({ file_id: fileInSpaceA_2.file_id }),
            ]),
          );
        });
      },
    );

    test(`✅ success - search files.
    - it does not return files owned by other users.`, async () => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const other = await createTestUser(tx);

        const fileInSpaceA_1 = await createTestSpaceAndAddFile(tx, other, 'OWNER');
        /* const fileInSpaceA_2 = */ await addTestFile(tx, operator, fileInSpaceA_1);
        /* const fileInSpaceB = */ await createTestSpaceAndAddFile(tx, operator, 'OWNER');

        const input: z.infer<typeof FileRouterSchema.searchInput> = {
          space_id: fileInSpaceA_1.space_id,
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

        // act
        const output = await caller.file.search(input);

        // assert
        expect(output.total).toBe(0);
        expect(output.file_list).toEqual([]);
      });
    });

    test(`✅ success - data not found in database.
    - it does not return groups.`, async () => {
      return transactionRollbackTrpc(prisma, async ({ caller }) => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.searchInput> = {
          space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
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

        // act
        const output = await caller.file.search(input);

        // assert
        expect(output.total).toBe(0);
        expect(output.file_list).toEqual([]);
      });
    });
  });

  describe(`search by where condition.`, () => {
    test(`search by filename`, async () => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const file1 = await createTestSpaceAndAddFile(tx, operator, 'OWNER', {
          filename: 'sentence',
        });
        /* const file2 =  */ await addTestFile(tx, operator, file1, {
          filename: 'tribute',
        });
        const file3 = await addTestFile(tx, operator, file1, {
          filename: 'nightmare',
        });

        const input: z.infer<typeof FileRouterSchema.searchInput> = {
          space_id: file1.space_id,
          where: {
            file_keyword: 'ght',
          },
          sort: {
            field: 'created_at',
            order: 'desc',
          },
          limit: 10,
          page: 1,
        };

        // act
        const output = await caller.file.search(input);

        // assert
        expect(output.total).toBe(1);
        expect(output.file_list).toContainEqual(
          expect.objectContaining({ file_id: file3.file_id }),
        );
      });
    });
    test(`search by todo title`, async () => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const file1 = await createTestSpaceAndAddFile(tx, operator, 'OWNER', {
          filename: 'filename',
        });
        /* const file2 = */ await addTestFile(tx, operator, file1, {
          filename: 'filename',
        });
        /* const file3 = */ await addTestFile(tx, operator, file1, {
          filename: 'filename',
        });

        // TODO relate todo list

        const input: z.infer<typeof FileRouterSchema.searchInput> = {
          space_id: file1.space_id,
          where: {
            file_keyword: 'ght',
          },
          sort: {
            field: 'created_at',
            order: 'desc',
          },
          limit: 10,
          page: 1,
        };

        // act
        const output = await caller.file.search(input);

        // assert
        expect(output.total).toBe(0);
        expect(output.file_list).toEqual([]);
      });
    });
  });

  test(`pagination`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file1 = await createTestSpaceAndAddFile(tx, operator, 'OWNER');
      /* const file2 = */ await addTestFile(tx, operator, file1);
      const file3 = await addTestFile(tx, operator, file1);

      const input: z.infer<typeof FileRouterSchema.searchInput> = {
        space_id: file1.space_id,
        where: {
          file_keyword: '',
        },
        sort: {
          field: 'created_at',
          order: 'asc',
        },
        limit: 2,
        page: 2,
      };

      // act
      const output = await caller.file.search(input);

      // assert
      expect(output.total).toBe(3);
      expect(output.file_list).toHaveLength(1);
      expect(output.file_list).toContainEqual(expect.objectContaining({ file_id: file3.file_id }));
    });
  });
});
