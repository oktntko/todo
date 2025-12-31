import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createWhiteboard } from './testWhiteboardRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.get`, () => {
  test(`✅ success - get whiteboard by whiteboard_id.
    - it return the whiteboard data.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createWhiteboard(tx, operator);

      const input: z.infer<typeof WhiteboardRouterSchema.getInput> = {
        whiteboard_id: whiteboard.whiteboard_id,
      };

      // act
      const output = await caller.whiteboard.get(input);

      // assert
      expect(output).toEqual(expect.objectContaining({ whiteboard_id: whiteboard.whiteboard_id }));
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.getInput> = {
        whiteboard_id: 999999, // not found
      };

      // act & assert
      await expect(caller.whiteboard.get(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
