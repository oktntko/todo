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

describe(`TodoRouter todo.applyChange`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - update todo, when operator has $role role.
    - it return the updated todo.
    - it save the record in the database.`,
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
        expect(output).toEqual(expect.objectContaining(input));

        // Verify the record is updated in the database
        const updated = await tx.todo.findUnique({
          where: { todo_id: todo.todo_id },
        });
        expect(updated).toEqual(expect.objectContaining(input));
      });
    },
  );

  test.for([
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
      - it throw FORBIDDEN error.`,
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
        const todo = await TodoFactory.create(tx, { group_id });

        const input: z.infer<typeof TodoRouterSchema.applyChangeInput> = {
          todo_id: todo.todo_id,
          group_id: todo.group_id,
          title: 'updated todo',
          description: 'updated description',
          begin_date: '2023-10-01',
          begin_time: '10:00',
          limit_date: '2023-10-10',
          limit_time: '18:00',
          order: 0,
          done_at: null,
        };

        // act & assert
        await expect(caller.todo.applyChange(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.applyChangeInput> = {
        todo_id: todo.todo_id,
        group_id: todo.group_id,
        title: 'updated todo',
        description: 'updated description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
      };

      // act & assert
      await expect(caller.todo.applyChange(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ access control - forbidden to update todo in other user's group.
    - it throw FORBIDDEN error.`, async () => {
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

      const otherSpace = await SpaceFactory.create(tx);
      const otherGroup = await GroupFactory.create(tx, {
        space_id: otherSpace.space_id,
      });

      const input: z.infer<typeof TodoRouterSchema.applyChangeInput> = {
        todo_id: todo.todo_id,
        group_id: otherGroup.group_id,
        title: 'updated todo',
        description: 'updated description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
      };

      // act & assert
      await expect(caller.todo.applyChange(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller, tx, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { group_id } = await GroupFactory.create(tx, {
        space_id,
      });
      const todo = await TodoFactory.create(tx, { group_id });

      const input: z.infer<typeof TodoRouterSchema.applyChangeInput> = {
        todo_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        group_id: todo.group_id,
        title: 'updated todo',
        description: 'updated description',
        begin_date: '2023-10-01',
        begin_time: '10:00',
        limit_date: '2023-10-10',
        limit_time: '18:00',
        order: 0,
        done_at: null,
      };

      // act & assert
      await expect(caller.todo.applyChange(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
