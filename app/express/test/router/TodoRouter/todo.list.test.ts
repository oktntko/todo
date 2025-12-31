import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';
import { createTodo } from './testTodoRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.list`, () => {
  test(`✅ success - list todos with group_id_list filter.
    - it return todos in specified groups.
    - it filter by todo_status (active).`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createGroup(tx, operator);
      const group2 = await createGroup(tx, operator);

      const todo1 = await createTodo(tx, { user_id: operator.user_id, group_id: group1.group_id });
      await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group1.group_id,
        done_at: new Date(),
      });
      await createTodo(tx, { user_id: operator.user_id, group_id: group2.group_id });

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        group_id_list: [group1.group_id],
        todo_status: 'active',
      };

      // act
      const output = await caller.todo.list(input);

      // assert
      expect(output).toHaveLength(1);
      expect(output[0]).toEqual(expect.objectContaining({ todo_id: todo1.todo_id }));
    });
  });

  test(`✅ success - list todos with done status filter.
    - it return only done todos.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      await createTodo(tx, { user_id: operator.user_id, group_id: group.group_id });
      const todo2 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        done_at: new Date(),
      });

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        group_id_list: [group.group_id],
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
      const group1 = await createGroup(tx, operator);
      const group2 = await createGroup(tx, operator);

      const todo1 = await createTodo(tx, { user_id: operator.user_id, group_id: group1.group_id });
      const todo2 = await createTodo(tx, { user_id: operator.user_id, group_id: group2.group_id });

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
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

      const groupOperator = await createGroup(tx, operator);
      const groupOther = await createGroup(tx, other);

      const todoOperator = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: groupOperator.group_id,
      });
      const todoOther = await createTodo(tx, {
        user_id: other.user_id,
        group_id: groupOther.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.listInput> = {
        group_id_list: [],
        todo_status: 'active',
      };

      // act
      const output = await caller.todo.list(input);

      // assert
      expect(output).toHaveLength(1);
      expect(output[0]).toEqual(expect.objectContaining({ todo_id: todoOperator.todo_id }));
      expect(output).not.toContainEqual(expect.objectContaining({ todo_id: todoOther.todo_id }));
    });
  });
});
