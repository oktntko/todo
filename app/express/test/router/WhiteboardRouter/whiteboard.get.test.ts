import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddWhiteboard } from './_WhiteboardRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.get`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - get whiteboard by whiteboard_id, when operator has $role role.
    - it return the whiteboard data.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, role);

        const input: z.infer<typeof WhiteboardRouterSchema.getInput> = {
          whiteboard_id: whiteboard.whiteboard_id,
        };

        // act
        const output = await caller.whiteboard.get(input);

        // assert
        expect(output).toEqual(
          expect.objectContaining({ whiteboard_id: whiteboard.whiteboard_id }),
        );
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, undefined);

      const input: z.infer<typeof WhiteboardRouterSchema.getInput> = {
        whiteboard_id: whiteboard.whiteboard_id,
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

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.getInput> = {
        whiteboard_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
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
