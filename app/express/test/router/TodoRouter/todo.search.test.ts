import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';
import { createTodo } from './testTodoRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.search`, () => {
  test(`✅ success - search by keyword.
    - it search in title and description.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const todo1 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        title: 'test keyword',
      });
      const todo2 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        title: 'another todo',
        description: 'contains keyword here',
      });
      const todo3 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        title: 'no match',
      });

      const input: z.infer<typeof TodoRouterSchema.searchInput> = {
        where: {
          group_id_list: [],
          todo_keyword: 'keyword',
          todo_status: [],
        },
        sort: {
          field: 'created_at',
          order: 'desc',
        },
        limit: 10,
        page: 1,
      };

      // act
      const output = await caller.todo.search(input);

      // assert
      expect(output.total).toBe(2);
      expect(output.todo_list).toContainEqual(expect.objectContaining({ todo_id: todo1.todo_id }));
      expect(output.todo_list).toContainEqual(expect.objectContaining({ todo_id: todo2.todo_id }));
      expect(output.todo_list).not.toContainEqual(
        expect.objectContaining({ todo_id: todo3.todo_id }),
      );
    });
  });

  test(`✅ success - filter by todo_status.
    - when todo_status array has only 'active', return only active todos.
    - when todo_status array has only 'done', return only done todos.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const todoActive = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
      });
      const todoDone = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group.group_id,
        done_at: new Date(),
      });

      const inputActive: z.infer<typeof TodoRouterSchema.searchInput> = {
        where: {
          group_id_list: [],
          todo_keyword: '',
          todo_status: ['active'],
        },
        sort: {
          field: 'created_at',
          order: 'desc',
        },
        limit: 10,
        page: 1,
      };

      // act
      const outputActive = await caller.todo.search(inputActive);

      // assert
      expect(outputActive.total).toBe(1);
      expect(outputActive.todo_list[0]).toEqual(
        expect.objectContaining({ todo_id: todoActive.todo_id }),
      );

      const inputDone: z.infer<typeof TodoRouterSchema.searchInput> = {
        where: {
          group_id_list: [],
          todo_keyword: '',
          todo_status: ['done'],
        },
        sort: {
          field: 'created_at',
          order: 'desc',
        },
        limit: 10,
        page: 1,
      };

      const outputDone = await caller.todo.search(inputDone);
      expect(outputDone.total).toBe(1);
      expect(outputDone.todo_list[0]).toEqual(
        expect.objectContaining({ todo_id: todoDone.todo_id }),
      );
    });
  });

  test(`✅ success - filter by group_id_list.
    - it only return todos in specified groups.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createGroup(tx, operator);
      const group2 = await createGroup(tx, operator);

      const todo1 = await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group1.group_id,
      });
      await createTodo(tx, {
        user_id: operator.user_id,
        group_id: group2.group_id,
      });

      const input: z.infer<typeof TodoRouterSchema.searchInput> = {
        where: {
          group_id_list: [group1.group_id],
          todo_keyword: '',
          todo_status: [],
        },
        sort: {
          field: 'created_at',
          order: 'desc',
        },
        limit: 10,
        page: 1,
      };

      // act
      const output = await caller.todo.search(input);

      // assert
      expect(output.total).toBe(1);
      expect(output.todo_list[0]).toEqual(expect.objectContaining({ todo_id: todo1.todo_id }));
    });
  });

  test(`✅ success - pagination.
    - it return paginated results based on limit and page.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const todos = [];
      for (let i = 0; i < 5; i++) {
        const todo = await createTodo(tx, {
          user_id: operator.user_id,
          group_id: group.group_id,
          title: `todo ${i}`,
        });
        todos.push(todo);
      }

      const input: z.infer<typeof TodoRouterSchema.searchInput> = {
        where: {
          group_id_list: [],
          todo_keyword: '',
          todo_status: [],
        },
        sort: {
          field: 'created_at',
          order: 'desc',
        },
        limit: 2,
        page: 2,
      };

      // act
      const output = await caller.todo.search(input);

      // assert
      expect(output.total).toBe(5);
      expect(output.todo_list).toHaveLength(2);
    });
  });
});
