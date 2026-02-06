import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddGroup } from './_GroupRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.get`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - get group by group_id, when operator has $role role.
    - it return the group data.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group = await createTestSpaceAndAddGroup(tx, operator, role);

        const input: z.infer<typeof GroupRouterSchema.getInput> = {
          group_id: group.group_id,
        };

        // act
        const output = await caller.group.get(input);

        // assert
        expect(output).toEqual(expect.objectContaining({ group_id: group.group_id }));
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createTestSpaceAndAddGroup(tx, operator, undefined);

      const input: z.infer<typeof GroupRouterSchema.getInput> = {
        group_id: group.group_id,
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

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof GroupRouterSchema.getInput> = {
        group_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
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
