import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { GroupFactory } from '../../factory/GroupFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { TodoFactory } from '../../factory/TodoFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.search`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - search todos owned by the login user, when operator has $role role.
    - it return todos ordered by group_order ascending.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });
        const { group_id } = await GroupFactory.create(tx, {
          space_id,
        });

        const todo1 = await TodoFactory.create(tx, { group_id, order: 2 });
        const todo2 = await TodoFactory.create(tx, { group_id, order: 0 });
        const todo3 = await TodoFactory.create(tx, { group_id, order: 1 });

        const otherAuthZSpace = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });
        const otherAuthZGroup = await GroupFactory.create(tx, {
          space_id: otherAuthZSpace.space_id,
        });

        const noAuthZSpace = await SpaceFactory.create(tx);
        const noAuthZGroup = await GroupFactory.create(tx, {
          space_id: noAuthZSpace.space_id,
        });

        await TodoFactory.create(tx, { group_id: otherAuthZGroup.group_id }); // 権限はあるが異なる space_id
        await TodoFactory.create(tx, { group_id: noAuthZGroup.group_id }); // 権限がない space_id

        const input: z.infer<typeof TodoRouterSchema.searchInput> = {
          space_id: todo1.group.space_id,
          where: {
            group_id_list: [],
            todo_keyword: '',
            todo_status: [],
          },
          limit: 10,
          page: 1,
          sort: {
            field: 'order',
            order: 'asc',
          },
        };

        // act
        const output = await caller.todo.search(input);

        // assert
        expect(output.total).toBe(3);
        expect(output.todo_list).toHaveLength(3);
        expect(output.todo_list).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ todo_id: todo1.todo_id }),
            expect.objectContaining({ todo_id: todo2.todo_id }),
            expect.objectContaining({ todo_id: todo3.todo_id }),
          ]),
        );
        // Verify order
        expect(output.todo_list[0]!.order).toBeLessThan(output.todo_list[1]!.order);
        expect(output.todo_list[1]!.order).toBeLessThan(output.todo_list[2]!.order);
      });
    },
  );

  test(`✅ success - search by keyword.
    - it search in title and description.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });

      const todo1 = await TodoFactory.create(tx, {
        group_id,
        title: 'test keyword',
      });
      const todo2 = await TodoFactory.create(tx, {
        group_id,
        title: 'another todo',
        description: 'contains keyword here',
      });
      const todo3 = await TodoFactory.create(tx, {
        group_id,
        title: 'no match',
      });

      const input: z.infer<typeof TodoRouterSchema.searchInput> = {
        space_id,
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
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });

      const todoActive = await TodoFactory.create(tx, {
        group_id,
        done_at: null,
      });
      const todoDone = await TodoFactory.create(tx, {
        group_id,
        done_at: new Date(),
      });

      const inputActive: z.infer<typeof TodoRouterSchema.searchInput> = {
        space_id,
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
        space_id,
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
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const groupA = await GroupFactory.create(tx, {
        space_id,
      });
      const groupB = await GroupFactory.create(tx, {
        space_id,
      });

      const todo1 = await TodoFactory.create(tx, { group_id: groupA.group_id });
      await TodoFactory.create(tx, { group_id: groupB.group_id });

      const input: z.infer<typeof TodoRouterSchema.searchInput> = {
        space_id,
        where: {
          group_id_list: [groupA.group_id],
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
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });

      const todos = [];
      for (let i = 0; i < 5; i++) {
        const todo = await TodoFactory.create(tx, {
          group_id,
          title: `todo ${i}`,
        });
        todos.push(todo);
      }

      const input: z.infer<typeof TodoRouterSchema.searchInput> = {
        space_id,
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
