import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createWhiteboard } from './testWhiteboardRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.update`, () => {
  test(`✅ success - update whiteboard.
    - it return the updated whiteboard.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createWhiteboard(tx, operator);

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
      expect(output).toEqual(
        expect.objectContaining({
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_name: input.whiteboard_name,
          whiteboard_description: input.whiteboard_description,
          whiteboard_content: input.whiteboard_content,
        }),
      );

      // Verify the record is updated in the database
      const updated = await tx.whiteboard.findUnique({
        where: { whiteboard_id: whiteboard.whiteboard_id },
      });
      expect(updated).not.toBeNull();
      expect(updated).toEqual(
        expect.objectContaining({
          whiteboard_name: input.whiteboard_name,
          whiteboard_description: input.whiteboard_description,
          whiteboard_content: input.whiteboard_content,
        }),
      );
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { whiteboard_id } = await createWhiteboard(tx, operator);

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
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.updateInput> = {
        whiteboard_id: 999999, // not found
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
