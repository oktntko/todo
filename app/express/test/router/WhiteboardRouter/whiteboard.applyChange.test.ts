import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpaceAndAddWhiteboard } from './_WhiteboardRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.applyChange`, () => {
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
        const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, role);

        const input: z.infer<typeof WhiteboardRouterSchema.applyChangeInput> = {
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_content: '{"test": true}',
        };

        // act
        const output = await caller.whiteboard.applyChange(input);

        // assert
        expect(output).toMatchObject({
          ...input,
        });

        // Verify the record is updated in the database
        const updated = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: whiteboard.whiteboard_id },
        });
        expect(updated).toMatchObject({
          ...input,
        });
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
        const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, role);

        const input: z.infer<typeof WhiteboardRouterSchema.applyChangeInput> = {
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_content: '{}',
        };

        // act & assert
        await expect(caller.whiteboard.applyChange(input)).rejects.toThrow(
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
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, undefined);

      const input: z.infer<typeof WhiteboardRouterSchema.applyChangeInput> = {
        whiteboard_id: whiteboard.whiteboard_id,
        whiteboard_content: '{}',
      };

      // act & assert
      await expect(caller.whiteboard.applyChange(input)).rejects.toThrow(
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
      const input: z.infer<typeof WhiteboardRouterSchema.applyChangeInput> = {
        whiteboard_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        whiteboard_content: '{}',
      };

      // act & assert
      await expect(caller.whiteboard.applyChange(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
