import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceGroupAndAddTodo } from './_TodoRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.delete`, () => {
  test(`✅ success - delete todo.
    - it return the deleted ID.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');

      const input: z.infer<typeof TodoRouterSchema.deleteInput> = {
        todo_id: todo.todo_id,
        updated_at: todo.updated_at,
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
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, undefined);

      const input: z.infer<typeof TodoRouterSchema.deleteInput> = {
        todo_id: todo.todo_id,
        updated_at: todo.updated_at,
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

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof TodoRouterSchema.deleteInput> = {
        todo_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        updated_at: new Date(2001, 2, 4),
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
