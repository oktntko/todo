import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.upsert`, () => {
  test(`✅ success - create when todo_id doesn't exist.
    - it return the created todo.
    - it save the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const input: z.infer<typeof TodoRouterSchema.upsertInput> = {
        todo_id: crypto.randomUUID(),
        group_id: group.group_id,
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
      const output = await caller.todo.upsert(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          todo_id: input.todo_id,
          group_id: group.group_id,
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

  test(`✅ success - update when todo_id already exists.
    - it return the updated todo.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);
      const todo = await tx.todo.create({
        data: {
          todo_id: crypto.randomUUID(),
          group_id: group.group_id,
          title: 'original title',
          description: '',
          order: 0,
          created_by: operator.user_id,
          updated_by: operator.user_id,
        },
        include: {
          group: true,
          file_list: true,
        },
      });

      const input: z.infer<typeof TodoRouterSchema.upsertInput> = {
        todo_id: todo.todo_id,
        group_id: group.group_id,
        title: 'updated title',
        description: 'updated description',
        begin_date: '2023-10-05',
        begin_time: '12:00',
        limit_date: '2023-10-15',
        limit_time: '20:00',
        order: 0,
        done_at: null,
      };

      // act
      const output = await caller.todo.upsert(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          todo_id: todo.todo_id,
          title: 'updated title',
          description: 'updated description',
        }),
      );

      // Verify the record is updated in the database
      const updated = await tx.todo.findUnique({
        where: { todo_id: todo.todo_id },
      });
      expect(updated?.title).toBe('updated title');
    });
  });

  test(`⚠️ access control - forbidden to upsert todo in other user's group.
    - it throw FORBIDDEN error when updating.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
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

      const groupOther = await createGroup(tx, other);
      const todoOther = await tx.todo.create({
        data: {
          todo_id: crypto.randomUUID(),
          group_id: groupOther.group_id,
          title: 'other todo',
          description: '',
          order: 0,
          created_by: other.user_id,
          updated_by: other.user_id,
        },
      });

      const input: z.infer<typeof TodoRouterSchema.upsertInput> = {
        todo_id: todoOther.todo_id,
        group_id: groupOther.group_id,
        title: 'hacked title',
        description: '',
        begin_date: '',
        begin_time: '',
        limit_date: '',
        limit_time: '',
        order: 0,
        done_at: null,
      };

      // act & assert
      await expect(caller.todo.upsert(input)).rejects.toThrow(
        new TRPCError({
          code: 'FORBIDDEN',
          message: message.error.FORBIDDEN,
        }),
      );
    });
  });

  test(`⚠️ validation error - group not found on create.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof TodoRouterSchema.upsertInput> = {
        todo_id: crypto.randomUUID(),
        group_id: 999999, // not found
        title: 'test todo',
        description: '',
        begin_date: '',
        begin_time: '',
        limit_date: '',
        limit_time: '',
        order: 0,
        done_at: null,
      };

      // act & assert
      await expect(caller.todo.upsert(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
