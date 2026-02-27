import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { GroupFactory } from '../../factory/GroupFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { TodoFactory } from '../../factory/TodoFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.applyChange`, () => {
  test(`✅ success - create when todo_id doesn't exist.
    - it return the created todo.
    - it save the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo = await TodoFactory.create(tx, { group_id });
      const newGroup = await GroupFactory.create(tx, { space_id });

      const input: z.infer<typeof TodoRouterSchema.applyChangeInput> = {
        todo_id: todo.todo_id,
        group_id: newGroup.group_id,
        title: 'upsert todo',
        description: 'test description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
      };

      // act
      const output = await caller.todo.applyChange(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          todo_id: input.todo_id,
          group_id: newGroup.group_id,
          title: 'upsert todo',
        }),
      );

      // Verify the record is saved in the database
      const created = await tx.todo.findUnique({
        where: { todo_id: input.todo_id },
      });
      expect(created).not.toBeNull();
    });
  });
});
