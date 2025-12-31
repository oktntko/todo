import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from './testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.delete`, () => {
  test(`✅ success - delete group.
    - it return the deleted ID.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
        group_id: group.group_id,
        updated_at: group.updated_at,
      };

      // act
      const output = await caller.group.delete(input);

      // assert
      expect(output).toEqual({ group_id: input.group_id });

      // Verify the record is deleted from the database
      const deleted = await tx.group.findUnique({
        where: { group_id: input.group_id },
      });
      expect(deleted).toBeNull();
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { group_id } = await createGroup(tx, operator);

      const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
        group_id,
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.group.delete(input)).rejects.toThrow(
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
      const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
        group_id: 999999, // not found
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.group.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
