import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from '../GroupRouter/testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.create`, () => {
  test(`✅ success - create a new todo.
    - it return the created todo.
    - it save the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const input: z.infer<typeof TodoRouterSchema.createInput> = {
        group_id: group.group_id,
        title: 'test todo',
        description: 'test description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
      };

      // act
      const output = await caller.todo.create(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          group_id: group.group_id,
          title: input.title,
          description: input.description,
        }),
      );

      // Verify the record is saved in the database
      const created = await tx.todo.findUnique({
        where: { todo_id: output.todo_id },
      });
      expect(created).not.toBeNull();
      expect(created).toEqual(expect.objectContaining({ title: input.title }));
    });
  });

  test(`⚠️ validation error - group not found.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof TodoRouterSchema.createInput> = {
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
      await expect(caller.todo.create(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ access control - group owned by other user.
    - it throw FORBIDDEN error.`, async () => {
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

      const groupOther = await tx.group.create({
        data: {
          group_id: Math.floor(Math.random() * 1000000),
          group_name: 'other group',
          group_description: '',
          group_order: 0,
          group_image: '',
          group_color: '#FFFFFF',
          owner_id: other.user_id,
          created_by: other.user_id,
          updated_by: other.user_id,
        },
      });

      const input: z.infer<typeof TodoRouterSchema.createInput> = {
        group_id: groupOther.group_id,
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
      await expect(caller.todo.create(input)).rejects.toThrow(
        new TRPCError({
          code: 'FORBIDDEN',
          message: message.error.FORBIDDEN,
        }),
      );
    });
  });
});
