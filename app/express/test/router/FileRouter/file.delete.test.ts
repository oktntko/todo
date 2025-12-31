import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createFile } from './testFileRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.delete`, () => {
  test(`✅ success - delete file.
    - it return the deleted ID.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        ...file,
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
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { file_id } = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id,
        updated_at: new Date(2001, 2, 4), // updated
      };

      // act & assert
      await expect(caller.file.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
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
