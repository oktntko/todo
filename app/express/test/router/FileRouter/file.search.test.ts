import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { FileFactory } from '../../factory/FileFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { UserFactory } from '../../factory/UserFactory';
import { transactionRollbackTrpc } from '../../helper';

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
          const spaceA = await SpaceFactory.create(tx, {
            user_id: operator.user_id,
            role,
          });
          const fileInSpaceA_1 = await FileFactory.create(tx, { space_id: spaceA.space_id });
          const fileInSpaceA_2 = await FileFactory.create(tx, { space_id: spaceA.space_id });

          const spaceB = await SpaceFactory.create(tx, {
            user_id: operator.user_id,
            role,
          });
          /* const fileInSpaceB = */ await FileFactory.create(tx, { space_id: spaceB.space_id });

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
        const other = await UserFactory.create(tx);

        const spaceA = await SpaceFactory.create(tx, {
          user_id: other.user_id,
          role: 'OWNER',
        });
        const fileInSpaceA_1 = await FileFactory.create(tx, { space_id: spaceA.space_id });
        /* const fileInSpaceA_2 = */ await FileFactory.create(tx, { space_id: spaceA.space_id });

        const spaceB = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role: 'OWNER',
        });
        /* const fileInSpaceB = */ await FileFactory.create(tx, { space_id: spaceB.space_id });
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
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role: 'OWNER',
        });

        /* const file1 = */ await FileFactory.create(tx, {
          space_id,
          filename: 'sentence',
        });
        /* const file2 =  */ await FileFactory.create(tx, {
          space_id,
          filename: 'tribute',
        });
        const file3 = await FileFactory.create(tx, {
          space_id,
          filename: 'nightmare',
        });

        const input: z.infer<typeof FileRouterSchema.searchInput> = {
          space_id,
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
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role: 'OWNER',
        });

        const file1 = await FileFactory.create(tx, {
          space_id,
          filename: 'filename',
        });
        /* const file2 = */ await FileFactory.create(tx, {
          space_id,
          filename: 'filename',
        });
        /* const file3 = */ await FileFactory.create(tx, {
          space_id,
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
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      /* const file1 = */ await FileFactory.create(tx, { space_id });
      /* const file2 = */ await FileFactory.create(tx, { space_id });
      const file3 = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.searchInput> = {
        space_id,
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
