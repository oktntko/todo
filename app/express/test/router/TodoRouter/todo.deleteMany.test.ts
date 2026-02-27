import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { GroupFactory } from '../../factory/GroupFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { TodoFactory } from '../../factory/TodoFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.deleteMany`, () => {
  test(`✅ success - delete multiple todos.
    - it return { ok: true }.
    - it delete all todos in the database.`, async () => {
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
      /* const todo3 = */ await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
        space_id,
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
      const output = await caller.todo.deleteMany(input);

      // assert
      expect(output).toEqual({ ok: true });

      // Verify the records are deleted from the database
      const deleted1 = await tx.todo.findUnique({
        where: { todo_id: todo1.todo_id },
      });
      const deleted2 = await tx.todo.findUnique({
        where: { todo_id: todo2.todo_id },
      });

      expect(deleted1).toBeNull();
      expect(deleted2).toBeNull();
    });
  });

  test(`⚠️ access control - forbidden to delete todos in other user's group.
    - it throw FORBIDDEN error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.deleteManyInput> = {
        space_id,
        target_list: [
          {
            todo_id: todo.todo_id,
            updated_at: todo.updated_at,
          },
        ],
      };

      // act & assert
      await expect(caller.todo.deleteMany(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
