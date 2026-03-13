import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { FileFactory } from '../../factory/FileFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.deleteMany`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - delete file, when operator has $role role.
    - it return { ok: true }.
    - it delete the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const file1 = await FileFactory.create(tx, { space_id });
        const file2 = await FileFactory.create(tx, { space_id });
        const file3 = await FileFactory.create(tx, { space_id }); // 削除しないファイル

        const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
          space_id: file1.space_id,
          target_list: [
            {
              file_id: file1.file_id,
              updated_at: file1.updated_at,
            },
            {
              file_id: file2.file_id,
              updated_at: file2.updated_at,
            },
          ],
        };

        // act
        const output = await caller.file.deleteMany(input);

        // assert
        expect(output).toEqual({ ok: true });

        expect(
          await tx.file.count({
            where: {
              file_id: {
                in: input.target_list.map((x) => x.file_id),
              },
            },
          }),
        ).toBe(0);
        expect(
          await tx.file.count({
            where: {
              file_id: file3.file_id,
            },
          }),
        ).toBe(1);
      });
    },
  );

  test.for([
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
      - it throw FORBIDDEN error.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const file = await FileFactory.create(tx, { space_id });

        const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
          space_id: file.space_id,
          target_list: [
            {
              file_id: file.file_id,
              updated_at: file.updated_at,
            },
          ],
        };

        // act & assert
        await expect(caller.file.deleteMany(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
          - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);
      const file = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
        space_id: file.space_id,
        target_list: [
          {
            file_id: file.file_id,
            updated_at: file.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
      - space not found in database.
      - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const file = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        target_list: [
          {
            file_id: file.file_id,
            updated_at: file.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - file not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const file1 = await FileFactory.create(tx, { space_id });
      const file2 = await FileFactory.create(tx, { space_id });
      const file3 = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
        space_id: file1.space_id,
        target_list: [
          {
            file_id: file1.file_id,
            updated_at: file1.updated_at,
          },
          {
            file_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
            updated_at: file2.updated_at,
          },
          {
            file_id: file3.file_id,
            updated_at: file3.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
        - contains files of spaces that are different from the input value.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const spaceA = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const file1 = await FileFactory.create(tx, { space_id: spaceA.space_id });

      const spaceB = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const file2 = await FileFactory.create(tx, { space_id: spaceB.space_id });

      const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
        space_id: file1.space_id,
        target_list: [
          {
            file_id: file1.file_id,
            updated_at: file1.updated_at,
          },
          {
            file_id: file2.file_id, // different space group
            updated_at: file2.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const file1 = await FileFactory.create(tx, { space_id });
      const file2 = await FileFactory.create(tx, { space_id });
      const file3 = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.deleteManyInput> = {
        space_id: file1.space_id,
        target_list: [
          {
            file_id: file1.file_id,
            updated_at: file1.updated_at,
          },
          {
            file_id: file2.file_id,
            updated_at: new Date(2001, 2, 4), // updated
          },
          {
            file_id: file3.file_id,
            updated_at: file3.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_CURRENT_UPDATED,
        }),
      );
    });
  });
});
