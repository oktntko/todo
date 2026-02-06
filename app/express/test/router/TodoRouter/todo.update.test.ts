import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { addTestGroup } from '../GroupRouter/_GroupRouterTestHelper';
import { createTestSpaceGroupAndAddTodo } from './_TodoRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.update`, () => {
  test(`✅ success - update todo.
    - it return the updated todo.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');
      const newGroup = await addTestGroup(tx, operator, todo.group);

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id: todo.todo_id,
        group_id: newGroup.group_id,
        title: 'updated todo',
        description: 'updated description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
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

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id: todo.todo_id,
        group_id: todo.group_id,
        title: 'updated todo',
        description: 'updated description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.todo.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_CURRENT_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ access control - forbidden to update todo in other user's group.
    - it throw FORBIDDEN error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');
      const otherGroup = await createTestSpaceGroupAndAddTodo(tx, operator, undefined);

      const input: z.infer<typeof TodoRouterSchema.updateInput> = {
        todo_id: todo.todo_id,
        group_id: otherGroup.group_id,
        title: 'updated todo',
        description: 'updated description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
        updated_at: todo.updated_at,
      };

      // act & assert
      await expect(caller.todo.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
