import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';
import { createTodo } from './testTodoRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.deleteMany`, () => {
  test(`✅ success - delete multiple todos.
    - it return { ok: true }.
    - it delete all todos in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);
      const todo1 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
      });
      const todo2 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = [
        { todo_id: todo1.todo_id },
        { todo_id: todo2.todo_id },
      ];

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
  });

  test(`⚠️ access control - forbidden to delete todos in other user's group.
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

      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = [
        { todo_id: todoOperator.todo_id },
        { todo_id: todoOther.todo_id },
      ];

      // act & assert
      await expect(caller.todo.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'FORBIDDEN',
          message: message.error.FORBIDDEN,
        }),
      );
    });
  });
});
