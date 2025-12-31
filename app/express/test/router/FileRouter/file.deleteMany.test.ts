import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createFile } from './testFileRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.deleteMany`, () => {
  test(`✅ success - delete files.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file1 = await createFile(tx, operator);
      const file2 = await createFile(tx, operator);
      const file3 = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [file1, file2, file3];

      // act
      const output = await caller.file.deleteMany(input);

      // assert
      expect(output).toEqual({ ok: true });

      expect(await tx.file.count({ where: { file_id: { in: input.map((x) => x.file_id) } } })).toBe(
        0,
      );
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file1 = await createFile(tx, operator);
      const file2 = await createFile(tx, operator);
      const file3 = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [
        {
          ...file1,
          updated_at: new Date(2001, 2, 4), // updated
        },
        file2,
        file3,
      ];

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file1 = await createFile(tx, operator);
      const file2 = await createFile(tx, operator);
      const file3 = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [
        {
          ...file1,
          file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
        },
        file2,
        file3,
      ];

      // act & assert
      await expect(caller.file.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
