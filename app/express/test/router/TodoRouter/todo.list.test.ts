import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { addTestGroup } from '../GroupRouter/_GroupRouterTestHelper';
import { addTestTodo, createTestSpaceGroupAndAddTodo } from './_TodoRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.list`, () => {
  test(`✅ success - list todos with group_id_list filter.
    - it return todos in specified groups.
    - it filter by todo_status (active).`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo1 = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');
      const todo2 = await addTestTodo(tx, operator, todo1);

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        space_id: todo1.group.space_id,
        group_id_list: [todo1.group_id],
        todo_status: 'active',
      };

      // act
      const output = await caller.todo.list(input);

      // assert
      expect(output).toHaveLength(2);
      expect(output[0]).toEqual(expect.objectContaining({ todo_id: todo1.todo_id }));
      expect(output[1]).toEqual(expect.objectContaining({ todo_id: todo2.todo_id }));
    });
  });

  test(`✅ success - list todos with done status filter.
    - it return only done todos.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo1 = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');
      const todo2 = await addTestTodo(tx, operator, todo1, {
        done_at: new Date(),
      });

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        space_id: todo1.group.space_id,
        group_id_list: [todo1.group_id],
        todo_status: 'done',
      };

      // act
      const output = await caller.todo.list(input);

      // assert
      expect(output).toHaveLength(1);
      expect(output[0]).toEqual(expect.objectContaining({ todo_id: todo2.todo_id }));
    });
  });

  test(`✅ success - list all todos when group_id_list is empty.
    - it return all todos in user's groups regardless of group.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo1 = await createTestSpaceGroupAndAddTodo(tx, operator, 'OWNER');
      const group2 = await addTestGroup(tx, operator, todo1.group);
      const todo2 = await addTestTodo(tx, operator, group2);

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        space_id: todo1.group.space_id,
        group_id_list: [],
        todo_status: 'active',
      };

      // act
      const output = await caller.todo.list(input);

      // assert
      expect(output).toHaveLength(2);
      expect(output).toContainEqual(expect.objectContaining({ todo_id: todo1.todo_id }));
      expect(output).toContainEqual(expect.objectContaining({ todo_id: todo2.todo_id }));
    });
  });

  test(`✅ success - filter by login user.
    - it only return todos in groups owned by the login user.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const todo = await createTestSpaceGroupAndAddTodo(tx, operator, undefined);

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        space_id: todo.group.space_id,
        group_id_list: [],
        todo_status: 'active',
      };

      // act
      const output = await caller.todo.list(input);

      // assert
      expect(output).toHaveLength(0);
    });
  });
});
