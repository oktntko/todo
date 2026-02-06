import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { addTestWhiteboard, createTestSpaceAndAddWhiteboard } from './_WhiteboardRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.reorder`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - reorder whiteboards, when operator has $role role.
    - it return { ok: true }.
    - it update the whiteboard_order in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const whiteboard1 = await createTestSpaceAndAddWhiteboard(tx, operator, role, {
          whiteboard_order: 2,
        });
        const whiteboard2 = await addTestWhiteboard(tx, operator, whiteboard1, {
          whiteboard_order: 0,
        });
        const whiteboard3 = await addTestWhiteboard(tx, operator, whiteboard1, {
          whiteboard_order: 1,
        });

        const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
          space_id: whiteboard1.space_id,
          order: [
            {
              whiteboard_id: whiteboard3.whiteboard_id,
              whiteboard_order: 0,
            },
            {
              whiteboard_id: whiteboard1.whiteboard_id,
              whiteboard_order: 2,
            },
            {
              whiteboard_id: whiteboard2.whiteboard_id,
              whiteboard_order: 1,
            },
          ],
        };

        // act
        const output = await caller.whiteboard.reorder(input);

        // assert
        expect(output).toEqual({ ok: true });

        // Verify the records are updated in the database
        const updated1 = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: whiteboard1.whiteboard_id },
        });
        const updated2 = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: whiteboard2.whiteboard_id },
        });
        const updated3 = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: whiteboard3.whiteboard_id },
        });

        expect(updated1.whiteboard_order).toBe(2);
        expect(updated2.whiteboard_order).toBe(1);
        expect(updated3.whiteboard_order).toBe(0);
      });
    },
  );

  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - reorder single whiteboard, when operator has $role role.
    - it return { ok: true }.
    - it update the whiteboard_order.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, role, {
          whiteboard_order: 0,
        });

        const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
          space_id: whiteboard.space_id,
          order: [
            {
              whiteboard_id: whiteboard.whiteboard_id,
              whiteboard_order: 5,
            },
          ],
        };

        // act
        const output = await caller.whiteboard.reorder(input);

        // assert
        expect(output).toEqual({ ok: true });

        // Verify the record is updated in the database
        const updated = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: whiteboard.whiteboard_id },
        });
        expect(updated.whiteboard_order).toBe(5);
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

        const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
          space_id: whiteboard.space_id,
          order: [
            {
              whiteboard_id: whiteboard.whiteboard_id,
              whiteboard_order: 5,
            },
          ],
        };

        // act & assert
        await expect(caller.whiteboard.reorder(input)).rejects.toThrow(
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

      const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
        space_id: whiteboard.space_id,
        order: [
          {
            whiteboard_id: whiteboard.whiteboard_id,
            whiteboard_order: 5,
          },
        ],
      };

      // act & assert
      await expect(caller.whiteboard.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
        - space not found in database.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, 'OWNER');

      const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        order: [
          {
            whiteboard_id: whiteboard.whiteboard_id,
            whiteboard_order: 5,
          },
        ],
      };

      // act & assert
      await expect(caller.whiteboard.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
        - whiteboard not found in database.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createTestSpaceAndAddWhiteboard(tx, operator, 'OWNER');

      const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
        space_id: whiteboard.space_id,
        order: [
          {
            whiteboard_id: whiteboard.whiteboard_id,
            whiteboard_order: 5,
          },
          {
            whiteboard_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
            whiteboard_order: 6,
          },
        ],
      };

      // act & assert
      await expect(caller.whiteboard.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
        - contains whiteboards of spaces that are different from the input value.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard1 = await createTestSpaceAndAddWhiteboard(tx, operator, 'OWNER');
      const whiteboard2 = await createTestSpaceAndAddWhiteboard(tx, operator, 'OWNER');

      const input: z.infer<typeof WhiteboardRouterSchema.reorderInput> = {
        space_id: whiteboard1.space_id,
        order: [
          {
            whiteboard_id: whiteboard1.whiteboard_id,
            whiteboard_order: 5,
          },
          {
            whiteboard_id: whiteboard2.whiteboard_id, // different space whiteboard
            whiteboard_order: 6,
          },
        ],
      };

      // act & assert
      await expect(caller.whiteboard.reorder(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
