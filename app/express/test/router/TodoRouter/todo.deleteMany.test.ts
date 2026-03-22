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

describe(`TodoRouter todo.deleteMany`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - delete multiple todos, when operator has $role role.
    - it return { ok: true }.
    - it delete all todos in the database.`,
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
        const todo1 = await TodoFactory.create(tx, { group_id });
        const todo2 = await TodoFactory.create(tx, { group_id });
        /* const todo3 = */ await TodoFactory.create(tx, { group_id });

        const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
          space_id,
          target_list: [
            {
              todo_id: todo1.todo_id,
              updated_at: todo1.updated_at,
            },
            {
              todo_id: todo2.todo_id,
              updated_at: todo2.updated_at,
            },
          ],
        };

        // act
        const output = await caller.todo.deleteMany(input);

        // assert
        expect(output).toEqual({ ok: true });

        // Verify the records are deleted from the database
        const deleted1 = await tx.todo.findUnique({
          where: { todo_id: todo1.todo_id },
        });
        const deleted2 = await tx.todo.findUnique({
          where: { todo_id: todo2.todo_id },
        });

        expect(deleted1).toBeNull();
        expect(deleted2).toBeNull();
      });
    },
  );

  test.for([
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
        const { group_id } = await GroupFactory.create(tx, {
          space_id,
        });
        const todo1 = await TodoFactory.create(tx, { group_id });
        const todo2 = await TodoFactory.create(tx, { group_id });
        /* const todo3 = */ await TodoFactory.create(tx, { group_id });

        const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
          space_id,
          target_list: [
            {
              todo_id: todo1.todo_id,
              updated_at: todo1.updated_at,
            },
            {
              todo_id: todo2.todo_id,
              updated_at: todo2.updated_at,
            },
          ],
        };

        // act & assert
        await expect(caller.todo.deleteMany(input)).rejects.toThrow(
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
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
        space_id,
        target_list: [
          {
            todo_id: todo.todo_id,
            updated_at: todo.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.todo.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller, tx, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
        space_id,
        target_list: [
          {
            todo_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
            updated_at: new Date(2001, 2, 4),
          },
        ],
      };

      // act & assert
      await expect(caller.todo.deleteMany(input)).rejects.toThrow(
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
      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        target_list: [
          {
            todo_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
            updated_at: new Date(2001, 2, 4),
          },
        ],
      };

      // act & assert
      await expect(caller.todo.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
