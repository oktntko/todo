import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { addTestFile, createTestSpaceAndAddFile } from './_FileRouterTestHelper';

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
        const file1 = await createTestSpaceAndAddFile(tx, operator, role);
        const file2 = await addTestFile(tx, operator, file1);
        const file3 = await addTestFile(tx, operator, file1); // 削除しないファイル

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
        const file = await createTestSpaceAndAddFile(tx, operator, role);

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
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file = await createTestSpaceAndAddFile(tx, operator, undefined);

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
      const file = await createTestSpaceAndAddFile(tx, operator, 'OWNER');

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
      const file1 = await createTestSpaceAndAddFile(tx, operator, 'OWNER');
      const file2 = await addTestFile(tx, operator, file1);
      const file3 = await addTestFile(tx, operator, file1);

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
      const file1 = await createTestSpaceAndAddFile(tx, operator, 'OWNER');
      const file2 = await createTestSpaceAndAddFile(tx, operator, 'OWNER');

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
      const file1 = await createTestSpaceAndAddFile(tx, operator, 'OWNER');
      const file2 = await addTestFile(tx, operator, file1);
      const file3 = await addTestFile(tx, operator, file1);

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
