import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddFile } from './_FileRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.delete`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - delete file, when operator has $role role.
    - it return the deleted ID.
    - it delete the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const file = await createTestSpaceAndAddFile(tx, operator, role);

        const input: z.infer<typeof FileRouterSchema.deleteInput> = {
          file_id: file.file_id,
          updated_at: file.updated_at,
        };

        // act
        const output = await caller.file.delete(input);

        // assert
        expect(output).toEqual({ file_id: input.file_id });

        const deleted = await tx.file.findUnique({
          where: { file_id: input.file_id },
        });
        expect(deleted).toBeNull();
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

        const input: z.infer<typeof FileRouterSchema.deleteInput> = {
          file_id: file.file_id,
          updated_at: file.updated_at,
        };

        // act & assert
        await expect(caller.file.delete(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { file_id } = await createTestSpaceAndAddFile(tx, operator, 'OWNER');

      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id,
        updated_at: new Date(2001, 2, 4), // updated
      };

      // act & assert
      await expect(caller.file.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_CURRENT_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ unauthorized error - operator has no authorization to the data.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file = await createTestSpaceAndAddFile(tx, operator, undefined);

      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id: file.file_id,
        updated_at: file.updated_at,
      };

      // act & assert
      await expect(caller.file.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.file.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
