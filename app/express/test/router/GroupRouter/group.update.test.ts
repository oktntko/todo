import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddGroup } from './_GroupRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.update`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
  ] as const)(
    `✅ success - update group, when operator has $role role.
    - it return the updated group.
    - it update the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group = await createTestSpaceAndAddGroup(tx, operator, role);

        const input: z.infer<typeof GroupRouterSchema.updateInput> = {
          group_id: group.group_id,
          group_name: 'updated group name',
          group_description: 'updated description',
          group_image: 'image.jpg',
          group_color: '#FF0000',
          updated_at: group.updated_at,
        };

        // act
        const output = await caller.group.update(input);

        // assert
        expect(output).toEqual({
          ...input,
          space_id: group.space_id,
          group_order: group.group_order,
          created_at: group.created_at,
          updated_at: output.updated_at,
          created_by: group.created_by,
          updated_by: operator.user_id,
        } satisfies typeof output);

        // Verify the record is updated in the database
        const updated = await tx.group.findUniqueOrThrow({
          where: { group_id: group.group_id },
        });
        expect(updated).toMatchObject({
          ...input,
          space_id: group.space_id,
          group_order: group.group_order,
          created_at: group.created_at,
          updated_at: output.updated_at,
          created_by: group.created_by,
          updated_by: operator.user_id,
        } satisfies typeof updated);
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

        const input: z.infer<typeof GroupRouterSchema.updateInput> = {
          group_id: group.group_id,
          group_name: 'updated group name',
          group_description: '',
          group_image: '',
          group_color: '',
          updated_at: group.updated_at,
        };

        // act & assert
        await expect(caller.group.update(input)).rejects.toThrow(
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

      const input: z.infer<typeof GroupRouterSchema.updateInput> = {
        group_id,
        group_name: 'updated name',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.group.update(input)).rejects.toThrow(
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

      const input: z.infer<typeof GroupRouterSchema.updateInput> = {
        group_id: group.group_id,
        group_name: 'updated name',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
        updated_at: group.updated_at,
      };

      // act & assert
      await expect(caller.group.update(input)).rejects.toThrow(
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
      const input: z.infer<typeof GroupRouterSchema.updateInput> = {
        group_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        group_name: 'updated name',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.group.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
