import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from './testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.get`, () => {
  test(`✅ success - get group by group_id.
    - it return the group data.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const input: z.infer<typeof GroupRouterSchema.getInput> = {
        group_id: group.group_id,
      };

      // act
      const output = await caller.group.get(input);

      // assert
      expect(output).toEqual(expect.objectContaining({ group_id: group.group_id }));
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof GroupRouterSchema.getInput> = {
        group_id: 999999, // not found
      };

      // act & assert
      await expect(caller.group.get(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
