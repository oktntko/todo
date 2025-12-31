import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';
import { createTodo } from './testTodoRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.delete`, () => {
  test(`✅ success - delete todo.
    - it return the deleted ID.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);
      const todo = await createTodo(tx, { user_id: operator.user_id, group_id: group.group_id });

      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id: todo.todo_id,
      };

      // act
      const output = await caller.todo.delete(input);

      // assert
      expect(output).toEqual({ todo_id: input.todo_id });

      // Verify the record is deleted from the database
      const deleted = await tx.todo.findUnique({
        where: { todo_id: input.todo_id },
      });
      expect(deleted).toBeNull();
    });
  });

  test(`⚠️ access control - forbidden to delete todo in other user's group.
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

      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id: todoOther.todo_id,
      };

      // act & assert
      await expect(caller.todo.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'FORBIDDEN',
          message: message.error.FORBIDDEN,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id: crypto.randomUUID(), // not found
      };

      // act & assert
      await expect(caller.todo.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
