import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';
import { createTodo } from './testTodoRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.update`, () => {
  test(`✅ success - update todo.
    - it return the updated todo.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);
      const todo = await createTodo(tx, { user_id: operator.user_id, group_id: group.group_id });

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id: todo.todo_id,
        title: 'updated todo',
        description: 'updated description',
        updated_at: todo.updated_at,
      };

      // act
      const output = await caller.todo.update(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          todo_id: todo.todo_id,
          title: 'updated todo',
          description: 'updated description',
        }),
      );

      // Verify the record is updated in the database
      const updated = await tx.todo.findUnique({
        where: { todo_id: todo.todo_id },
      });
      expect(updated).toEqual(
        expect.objectContaining({
          title: 'updated todo',
          description: 'updated description',
        }),
      );
    });
  });

  test(`✅ success - update with group_id change.
    - it update todo to a different group if user owns it.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createGroup(tx, operator);
      const group2 = await createGroup(tx, operator);
      const todo = await createTodo(tx, { user_id: operator.user_id, group_id: group1.group_id });

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id: todo.todo_id,
        group_id: group2.group_id,
        title: 'moved todo',
        updated_at: todo.updated_at,
      };

      // act
      const output = await caller.todo.update(input);

      // assert
      expect(output).toEqual(expect.objectContaining({ group_id: group2.group_id }));
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);
      const { todo_id } = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id,
        title: 'updated title',
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.todo.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ access control - forbidden to update todo in other user's group.
    - it throw FORBIDDEN error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const other = await tx.user.create({
        data: {
          user_id: '019b7403-f2c4-73ee-92c7-045f7a9b842e',
          username: 'other.user',
          email: 'other.user@example.com',
          password: 'password.other.user@example.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const groupOther = await createGroup(tx, other);
      const todoOther = await createTodo(tx, {
        user_id: other.user_id,
        group_id: groupOther.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id: todoOther.todo_id,
        title: 'hacked title',
        updated_at: todoOther.updated_at,
      };

      // act & assert
      await expect(caller.todo.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'FORBIDDEN',
          message: message.error.FORBIDDEN,
        }),
      );
    });
  });
});
