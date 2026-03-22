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

describe(`TodoRouter todo.updateMany`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - update multiple todos, when operator has $role role.
    - it return { ok: true }.
    - it update all todos in the database.`,
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

        const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
          space_id: todo1.group.space_id,
          data: {
            description: 'batch updated description',
          },
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
        const output = await caller.todo.updateMany(input);

        // assert
        expect(output).toEqual({ ok: true });

        // Verify the records are updated in the database
        const updated1 = await tx.todo.findUniqueOrThrow({
          where: { todo_id: todo1.todo_id },
        });
        const updated2 = await tx.todo.findUniqueOrThrow({
          where: { todo_id: todo2.todo_id },
        });

        expect(updated1.description).toBe('batch updated description');
        expect(updated2.description).toBe('batch updated description');
      });
    },
  );

  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - update with group_id change.
    - it update group_id for all todos.`,
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

        const newGroup = await GroupFactory.create(tx, {
          space_id,
        });

        const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
          space_id: todo1.group.space_id,
          data: {
            group_id: newGroup.group_id,
          },
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
        const output = await caller.todo.updateMany(input);

        // assert
        expect(output).toEqual({ ok: true });

        const updated1 = await tx.todo.findUniqueOrThrow({
          where: { todo_id: todo1.todo_id },
        });
        const updated2 = await tx.todo.findUniqueOrThrow({
          where: { todo_id: todo2.todo_id },
        });

        expect(updated1.group_id).toBe(newGroup.group_id);
        expect(updated2.group_id).toBe(newGroup.group_id);
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

        const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
          space_id,
          data: {
            description: 'batch updated description',
          },
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
        await expect(caller.todo.updateMany(input)).rejects.toThrow(
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
      const todo1 = await TodoFactory.create(tx, { group_id });
      const todo2 = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id,
        data: {
          description: 'batch updated description',
        },
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
      await expect(caller.todo.updateMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - group not found in current space.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo1 = await TodoFactory.create(tx, { group_id });
      const todo2 = await TodoFactory.create(tx, { group_id });

      // 権限を持つが現在のスペースとは別のスペースのグループを設定する
      const otherSpace = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const otherGroup = await GroupFactory.create(tx, {
        space_id: otherSpace.space_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id,
        data: {
          group_id: otherGroup.group_id,
        },
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
      await expect(caller.todo.updateMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo1 = await TodoFactory.create(tx, { group_id });
      const todo2 = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id,
        data: {
          description: 'batch updated description',
        },
        target_list: [
          {
            todo_id: todo1.todo_id,
            updated_at: todo1.updated_at,
          },
          {
            todo_id: todo2.todo_id,
            updated_at: new Date(2001, 2, 4), // outdated
          },
        ],
      };

      // act & assert
      await expect(caller.todo.updateMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_CURRENT_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo1 = await TodoFactory.create(tx, { group_id });
      const todo2 = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id,
        data: {
          description: 'batch updated description',
        },
        target_list: [
          {
            todo_id: todo1.todo_id,
            updated_at: todo1.updated_at,
          },
          {
            todo_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
            updated_at: todo2.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.todo.updateMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - todo not found in current space.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const authorizedSpace = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const authorizedGroup = await GroupFactory.create(tx, {
        space_id: authorizedSpace.space_id,
      });
      const authorizedTodo = await TodoFactory.create(tx, { group_id: authorizedGroup.group_id });

      // 権限を持つが現在のスペースとは別のスペースのTodoを設定する
      const unauthorizedSpace = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const unauthorizedGroup = await GroupFactory.create(tx, {
        space_id: unauthorizedSpace.space_id,
      });
      const unauthorizedTodo = await TodoFactory.create(tx, {
        group_id: unauthorizedGroup.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id: authorizedTodo.group.space_id,
        data: {
          description: 'batch updated description',
        },
        target_list: [
          {
            todo_id: authorizedTodo.todo_id,
            updated_at: authorizedTodo.updated_at,
          },
          {
            todo_id: unauthorizedTodo.todo_id,
            updated_at: unauthorizedTodo.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.todo.updateMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
