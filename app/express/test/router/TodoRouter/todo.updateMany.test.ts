import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';
import { createTodo } from './testTodoRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.updateMany`, () => {
  test(`✅ success - update multiple todos.
    - it return { ok: true }.
    - it update all todos in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);
      const todo1 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        title: 'todo 1',
      });
      const todo2 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        title: 'todo 2',
      });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        description: 'batch updated description',
        list: [
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
      const updated1 = await tx.todo.findUnique({
        where: { todo_id: todo1.todo_id },
      });
      const updated2 = await tx.todo.findUnique({
        where: { todo_id: todo2.todo_id },
      });

      expect(updated1?.description).toBe('batch updated description');
      expect(updated2?.description).toBe('batch updated description');
    });
  });

  test(`✅ success - update with group_id change.
    - it update group_id for all todos.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createGroup(tx, operator);
      const group2 = await createGroup(tx, operator);
      const todo1 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group1.group_id,
      });
      const todo2 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group1.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        group_id: group2.group_id,
        list: [
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

      const updated1 = await tx.todo.findUnique({
        where: { todo_id: todo1.todo_id },
      });
      const updated2 = await tx.todo.findUnique({
        where: { todo_id: todo2.todo_id },
      });

      expect(updated1?.group_id).toBe(group2.group_id);
      expect(updated2?.group_id).toBe(group2.group_id);
    });
  });

  test(`⚠️ access control - forbidden to update todos in other user's group.
    - it throw FORBIDDEN error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
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

      const group = await createGroup(tx, operator);
      const groupOther = await createGroup(tx, other);
      const todoOperator = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
      });
      const todoOther = await createTodo(tx, {
        user_id: other.user_id,
        group_id: groupOther.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        description: 'hacked',
        list: [
          {
            todo_id: todoOperator.todo_id,
            updated_at: todoOperator.updated_at,
          },
          {
            todo_id: todoOther.todo_id,
            updated_at: todoOther.updated_at,
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
  });
});
