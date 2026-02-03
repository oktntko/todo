import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { addTestGroup, createTestSpaceAndAddGroup } from './_GroupRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.reorder`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
  ] as const)(
    `✅ success - reorder groups, when operator has $role role.
    - it return { ok: true }.
    - it update the group_order in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group1 = await createTestSpaceAndAddGroup(tx, operator, role, { group_order: 2 });
        const group2 = await addTestGroup(tx, operator, group1, { group_order: 0 });
        const group3 = await addTestGroup(tx, operator, group1, { group_order: 1 });

        await createTestSpaceAndAddGroup(tx, operator, role); // 権限はあるが異なる space_id
        await createTestSpaceAndAddGroup(tx, operator, undefined); // 権限がない space_id

        const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
          space_id: group1.space_id,
          order: [
            {
              group_id: group3.group_id,
              group_order: 0,
            },
            {
              group_id: group1.group_id,
              group_order: 2,
            },
            {
              group_id: group2.group_id,
              group_order: 1,
            },
          ],
        };

        // act
        const output = await caller.group.reorder(input);

        // assert
        expect(output).toEqual({ ok: true });

        // Verify the records are updated in the database
        const updated1 = await tx.group.findUniqueOrThrow({
          where: { group_id: group1.group_id },
        });
        const updated2 = await tx.group.findUniqueOrThrow({
          where: { group_id: group2.group_id },
        });
        const updated3 = await tx.group.findUniqueOrThrow({
          where: { group_id: group3.group_id },
        });

        expect(updated1.group_order).toBe(2);
        expect(updated2.group_order).toBe(1);
        expect(updated3.group_order).toBe(0);
      });
    },
  );

  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
  ] as const)(
    `✅ success - reorder single group, when operator has $role role.
    - it return { ok: true }.
    - it update the group_order.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group = await createTestSpaceAndAddGroup(tx, operator, role, { group_order: 0 });

        const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
          space_id: group.space_id,
          order: [
            {
              group_id: group.group_id,
              group_order: 5,
            },
          ],
        };

        // act
        const output = await caller.group.reorder(input);

        // assert
        expect(output).toEqual({ ok: true });

        // Verify the record is updated in the database
        const updated = await tx.group.findUniqueOrThrow({
          where: { group_id: group.group_id },
        });
        expect(updated.group_order).toBe(5);
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

        const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
          space_id: group.space_id,
          order: [
            {
              group_id: group.group_id,
              group_order: 5,
            },
          ],
        };

        // act & assert
        await expect(caller.group.reorder(input)).rejects.toThrow(
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
      const group = await createTestSpaceAndAddGroup(tx, operator, undefined);

      const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
        space_id: group.space_id,
        order: [
          {
            group_id: group.group_id,
            group_order: 5,
          },
        ],
      };

      // act & assert
      await expect(caller.group.reorder(input)).rejects.toThrow(
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
      const group = await createTestSpaceAndAddGroup(tx, operator, 'OWNER');

      const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        order: [
          {
            group_id: group.group_id,
            group_order: 5,
          },
        ],
      };

      // act & assert
      await expect(caller.group.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
      - group not found in database.
      - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createTestSpaceAndAddGroup(tx, operator, 'OWNER');

      const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
        space_id: group.space_id,
        order: [
          {
            group_id: group.group_id,
            group_order: 5,
          },
          {
            group_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
            group_order: 6,
          },
        ],
      };

      // act & assert
      await expect(caller.group.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
      - contains groups of spaces that are different from the input value.
      - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createTestSpaceAndAddGroup(tx, operator, 'OWNER');
      const group2 = await createTestSpaceAndAddGroup(tx, operator, 'OWNER');

      const input: z.infer<typeof GroupRouterSchema.reorderInput> = {
        space_id: group1.space_id,
        order: [
          {
            group_id: group1.group_id,
            group_order: 5,
          },
          {
            group_id: group2.group_id, // different space group
            group_order: 6,
          },
        ],
      };

      // act & assert
      await expect(caller.group.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
