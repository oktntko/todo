import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createWhiteboard } from './testWhiteboardRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.delete`, () => {
  test(`✅ success - delete whiteboard.
    - it return the deleted ID.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createWhiteboard(tx, operator);

      const input: z.infer<typeof WhiteboardRouterSchema.deleteInput> = {
        whiteboard_id: whiteboard.whiteboard_id,
        updated_at: whiteboard.updated_at,
      };

      // act
      const output = await caller.whiteboard.delete(input);

      // assert
      expect(output).toEqual({ whiteboard_id: input.whiteboard_id });

      // Verify the record is deleted from the database
      const deleted = await tx.whiteboard.findUnique({
        where: { whiteboard_id: input.whiteboard_id },
      });
      expect(deleted).toBeNull();
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { whiteboard_id } = await createWhiteboard(tx, operator);

      const input: z.infer<typeof WhiteboardRouterSchema.deleteInput> = {
        whiteboard_id,
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.whiteboard.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.deleteInput> = {
        whiteboard_id: 999999, // not found
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.whiteboard.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
