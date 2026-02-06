import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceGroupAndAddTodo } from './_TodoRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.get`, () => {
  test(`✅ success - get todo by todo_id.
    - it return the todo data with group and file_list.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');

      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id: todo.todo_id,
      };

      // act
      const output = await caller.todo.get(input);

      // assert
      expect(output).toEqual(expect.objectContaining({ todo_id: todo.todo_id }));
      expect(output.group).toBeDefined();
      expect(output.file_list).toBeDefined();
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

  test(`⚠️ access control - forbidden to access todo in other user's group.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, undefined);

      const input: z.infer<typeof TodoRouterSchema.getInput> = {
        todo_id: todo.todo_id,
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
