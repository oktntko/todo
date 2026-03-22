import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { GroupFactory } from '../../factory/GroupFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { TodoFactory } from '../../factory/TodoFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.list`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - list todos owned by the login user, when operator has $role role.
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

        const input: z.infer<typeof TodoRouterSchema.listInput> = {
          space_id: todo1.group.space_id,
          group_id_list: [],
          todo_status: 'active',
        };

        // act
        const output = await caller.todo.list(input);

        // assert
        expect(output).toHaveLength(3);
        expect(output).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ todo_id: todo1.todo_id }),
            expect.objectContaining({ todo_id: todo2.todo_id }),
            expect.objectContaining({ todo_id: todo3.todo_id }),
          ]),
        );
        // Verify order
        expect(output[0]!.order).toBeLessThan(output[1]!.order);
        expect(output[1]!.order).toBeLessThan(output[2]!.order);
      });
    },
  );

  test(`✅ success - list todos with group_id_list filter.
    - it return todos in specified groups.
    - it filter by todo_status (active).`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo1 = await TodoFactory.create(tx, { group_id, order: 0 });
      const todo2 = await TodoFactory.create(tx, { group_id, order: 1 });

      const otherGroup = await GroupFactory.create(tx, {
        space_id,
      });
      await TodoFactory.create(tx, { group_id: otherGroup.group_id, order: 0 });

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

      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo1 = await TodoFactory.create(tx, { group_id });
      const todo2 = await TodoFactory.create(tx, { group_id, done_at: new Date() });

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
      const todo2 = await TodoFactory.create(tx, { group_id: groupB.group_id });

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
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo = await TodoFactory.create(tx, { group_id });

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
