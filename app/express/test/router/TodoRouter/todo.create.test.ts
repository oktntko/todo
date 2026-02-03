import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddGroup } from '../GroupRouter/_GroupRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`TodoRouter todo.create`, () => {
  test(`✅ success - create a new todo.
    - it return the created todo.
    - it save the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createTestSpaceAndAddGroup(tx, operator, 'OWNER');

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
        group_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
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
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ access control - group owned by other user.
    - it throw FORBIDDEN error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createTestSpaceAndAddGroup(tx, operator, undefined);

      const input: z.infer<typeof TodoRouterSchema.createInput> = {
        group_id: group.group_id,
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
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
