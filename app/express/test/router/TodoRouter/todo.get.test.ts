import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { GroupFactory } from '../../factory/GroupFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { TodoFactory } from '../../factory/TodoFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.get`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - get todo by todo_id, when operator has $role role.
    - it return the todo data with group and file_list.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });
        const { group_id } = await GroupFactory.create(tx, {
          space_id,
        });
        const { todo_id } = await TodoFactory.create(tx, { group_id });

        const input: z.infer<typeof TodoRouterSchema.getInput> = {
          todo_id,
        };

        // act
        const output = await caller.todo.get(input);

        // assert
        expect(output).toEqual(expect.objectContaining({ todo_id }));
        expect(output.group).toBeDefined();
        expect(output.file_list).toBeDefined();
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const { todo_id } = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id,
      };

      // act & assert
      await expect(caller.todo.get(input)).rejects.toThrow(
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
      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
      };

      // act & assert
      await expect(caller.todo.get(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
