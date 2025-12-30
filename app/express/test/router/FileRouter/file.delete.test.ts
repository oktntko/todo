import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createFile } from './testFileRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.delete`, () => {
  test(`success`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      const file = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        ...file,
      };

      //
      const output = await caller.file.delete(input);

      //
      expect(output).toEqual({ file_id: input.file_id });
    });
  });

  test(`fail. previous is updated.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      const { file_id } = await createFile(tx, operator);

      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id,
        updated_at: new Date(2001, 2, 4), // updated
      };

      //
      await expect(caller.file.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`fail. data is not exist.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      const input: z.infer<typeof FileRouterSchema.deleteInput> = {
        file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
        updated_at: new Date(2001, 2, 4),
      };

      //
      await expect(caller.file.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  describe(`test data access`, () => {
    test(`FileRepository.deleteFile single`, async () => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        const file = await createFile(tx, operator);

        const input: z.infer<typeof FileRouterSchema.deleteInput> = {
          ...file,
        };

        //
        const output = await caller.file.delete(input);

        //
        expect(output).toEqual({ file_id: input.file_id });
        expect(await tx.file.findUnique({ where: { file_id: output.file_id } })).toBeNull();
      });
    });
  });
});
