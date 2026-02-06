import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddGroup } from './_GroupRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.delete`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
  ] as const)(
    `✅ success - delete group, when operator has $role role.
    - it return the deleted ID.
    - it delete the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group = await createTestSpaceAndAddGroup(tx, operator, role);

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
    },
  );

  test.for([
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
    - it throw FORBIDDEN error.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group = await createTestSpaceAndAddGroup(tx, operator, role);

        const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
          group_id: group.group_id,
          updated_at: group.updated_at,
        };

        // act & assert
        await expect(caller.group.delete(input)).rejects.toThrow(
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
      const { group_id } = await createTestSpaceAndAddGroup(tx, operator, 'OWNER');

      const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
        group_id,
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.group.delete(input)).rejects.toThrow(
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
      const group = await createTestSpaceAndAddGroup(tx, operator, undefined);

      const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
        group_id: group.group_id,
        updated_at: group.updated_at,
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

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof GroupRouterSchema.deleteInput> = {
        group_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
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
