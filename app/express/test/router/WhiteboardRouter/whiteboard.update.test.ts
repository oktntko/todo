import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

import { SpaceFactory } from '../../factory/SpaceFactory';
import { WhiteboardFactory } from '../../factory/WhiteboardFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.update`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - update whiteboard, when operator has $role role.
    - it return the updated whiteboard.
    - it update the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });
        const whiteboard = await WhiteboardFactory.create(tx, { space_id });

        const input: z.infer<typeof WhiteboardRouterSchema.updateInput> = {
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_name: 'updated whiteboard name',
          whiteboard_description: 'updated description',
          whiteboard_content: '{"test": true}',
          updated_at: whiteboard.updated_at,
        };

        // act
        const output = await caller.whiteboard.update(input);

        // assert
        expect(output).toEqual({
          ...input,
          space_id: whiteboard.space_id,
          whiteboard_order: whiteboard.whiteboard_order,
          created_at: whiteboard.created_at,
          updated_at: output.updated_at,
          created_by: whiteboard.created_by,
          updated_by: operator.user_id,
        } satisfies typeof output);

        // Verify the record is updated in the database
        const updated = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: whiteboard.whiteboard_id },
        });
        expect(updated).toEqual({
          ...input,
          space_id: whiteboard.space_id,
          whiteboard_order: whiteboard.whiteboard_order,
          created_at: whiteboard.created_at,
          updated_at: output.updated_at,
          created_by: whiteboard.created_by,
          updated_by: operator.user_id,
        } satisfies typeof updated);
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
        const whiteboard = await WhiteboardFactory.create(tx, { space_id });

        const input: z.infer<typeof WhiteboardRouterSchema.updateInput> = {
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_name: 'updated name',
          whiteboard_description: '',
          whiteboard_content: '{}',
          updated_at: whiteboard.updated_at,
        };

        // act & assert
        await expect(caller.whiteboard.update(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const { whiteboard_id } = await WhiteboardFactory.create(tx, { space_id });

      const input: z.infer<typeof WhiteboardRouterSchema.updateInput> = {
        whiteboard_id,
        whiteboard_name: 'updated name',
        whiteboard_description: '',
        whiteboard_content: '{}',
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.whiteboard.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_CURRENT_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ unauthorized error - operator has no authorization to the data.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);
      const whiteboard = await WhiteboardFactory.create(tx, { space_id });

      const input: z.infer<typeof WhiteboardRouterSchema.updateInput> = {
        whiteboard_id: whiteboard.whiteboard_id,
        whiteboard_name: 'updated name',
        whiteboard_description: '',
        whiteboard_content: '{}',
        updated_at: whiteboard.updated_at,
      };

      // act & assert
      await expect(caller.whiteboard.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.updateInput> = {
        whiteboard_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        whiteboard_name: 'updated name',
        whiteboard_description: '',
        whiteboard_content: '{}',
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.whiteboard.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
