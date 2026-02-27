import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { GroupFactory } from '../../factory/GroupFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { TodoFactory } from '../../factory/TodoFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.updateMany`, () => {
  test(`✅ success - update multiple todos.
    - it return { ok: true }.
    - it update all todos in the database.`, async () => {
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
      const todo2 = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id: todo1.group.space_id,
        data: {
          description: 'batch updated description',
        },
        target_list: [
          {
            todo_id: todo1.todo_id,
            updated_at: todo1.updated_at,
          },
          {
            todo_id: todo2.todo_id,
            updated_at: todo2.updated_at,
          },
        ],
      };

      // act
      const output = await caller.todo.updateMany(input);

      // assert
      expect(output).toEqual({ ok: true });

      // Verify the records are updated in the database
      const updated1 = await tx.todo.findUniqueOrThrow({
        where: { todo_id: todo1.todo_id },
      });
      const updated2 = await tx.todo.findUniqueOrThrow({
        where: { todo_id: todo2.todo_id },
      });

      expect(updated1.description).toBe('batch updated description');
      expect(updated2.description).toBe('batch updated description');
    });
  });

  test(`✅ success - update with group_id change.
    - it update group_id for all todos.`, async () => {
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
      const todo2 = await TodoFactory.create(tx, { group_id });

      const newGroup = await GroupFactory.create(tx, {
        space_id,
      });

      const input: z.infer<typeof TodoRouterSchema.updateManyInput> = {
        space_id: todo1.group.space_id,
        data: {
          group_id: newGroup.group_id,
        },
        target_list: [
          {
            todo_id: todo1.todo_id,
            updated_at: todo1.updated_at,
          },
          {
            todo_id: todo2.todo_id,
            updated_at: todo2.updated_at,
          },
        ],
      };

      // act
      const output = await caller.todo.updateMany(input);

      // assert
      expect(output).toEqual({ ok: true });

      const updated1 = await tx.todo.findUnique({
        where: { todo_id: todo1.todo_id },
      });
      const updated2 = await tx.todo.findUnique({
        where: { todo_id: todo2.todo_id },
      });

      expect(updated1?.group_id).toBe(newGroup.group_id);
      expect(updated2?.group_id).toBe(newGroup.group_id);
    });
  });
});
