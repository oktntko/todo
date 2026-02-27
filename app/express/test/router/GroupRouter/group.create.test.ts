import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';

import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.create`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
  ] as const)(
    `✅ success - create a new group, when operator has $role role.
    - it return the created group.
    - it create the record in the database.
    - it assign group_order automatically.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const input: z.infer<typeof GroupRouterSchema.createInput> = {
          space_id,
          group_name: 'test group',
          group_description: 'test description',
          group_image: 'iVBORw0KGgoANeSU',
          group_color: '#FFFFFF',
        };

        // act
        const output = await caller.group.create(input);

        // assert
        expect(output).toEqual({
          ...input,
          group_id: output.group_id,
          group_order: 0,
          created_at: output.created_at,
          updated_at: output.updated_at,
          created_by: operator.user_id,
          updated_by: operator.user_id,
        } satisfies typeof output);

        // Verify the record is saved in the database
        const created = await tx.group.findUnique({
          where: { group_id: output.group_id },
        });
        expect(created).toMatchObject({
          ...input,
          group_id: output.group_id,
          group_order: 0,
          created_at: output.created_at,
          updated_at: output.updated_at,
          created_by: operator.user_id,
          updated_by: operator.user_id,
        });
      });
    },
  );

  test(`✅ success - group_order is assigned correctly.
    - when creating the first group, group_order should be 0.
    - when creating the second group, group_order should be 1.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const input1: z.infer<typeof GroupRouterSchema.createInput> = {
        space_id,
        group_name: 'first group',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
      };

      const input2: z.infer<typeof GroupRouterSchema.createInput> = {
        space_id,
        group_name: 'second group',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
      };

      // act
      const output1 = await caller.group.create(input1);
      const output2 = await caller.group.create(input2);

      // assert
      expect(output1.group_order).toBe(0);
      expect(output2.group_order).toBe(1);
    });
  });

  test.for([
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
    - it throw FORBIDDEN error.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const input: z.infer<typeof GroupRouterSchema.createInput> = {
          space_id,
          group_name: 'test group',
          group_description: '',
          group_image: '',
          group_color: '#FFFFFF',
        };

        // act & assert
        await expect(caller.group.create(input)).rejects.toThrow(
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
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);

      const input: z.infer<typeof GroupRouterSchema.createInput> = {
        space_id,
        group_name: 'test group',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
      };

      // act & assert
      await expect(caller.group.create(input)).rejects.toThrow(
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
      const input: z.infer<typeof GroupRouterSchema.createInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        group_name: 'test group',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
      };

      // act & assert
      await expect(caller.group.create(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
