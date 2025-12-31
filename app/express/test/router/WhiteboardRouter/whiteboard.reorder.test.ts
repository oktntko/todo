import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createWhiteboard } from './testWhiteboardRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.reorder`, () => {
  test(`✅ success - reorder whiteboards.
    - it return { ok: true }.
    - it update the whiteboard_order in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard1 = await createWhiteboard(tx, operator, {
        whiteboard_order: 0,
      });
      const whiteboard2 = await createWhiteboard(tx, operator, {
        whiteboard_order: 1,
      });
      const whiteboard3 = await createWhiteboard(tx, operator, {
        whiteboard_order: 2,
      });

      const input: z.infer<typeof WhiteboardRouterSchema.reorderInputList> = [
        {
          whiteboard_id: whiteboard3.whiteboard_id,
          whiteboard_order: 0,
        },
        {
          whiteboard_id: whiteboard2.whiteboard_id,
          whiteboard_order: 1,
        },
        {
          whiteboard_id: whiteboard1.whiteboard_id,
          whiteboard_order: 2,
        },
      ];

      // act
      const output = await caller.whiteboard.reorder(input);

      // assert
      expect(output).toEqual({ ok: true });

      // Verify the records are updated in the database
      const updated1 = await tx.whiteboard.findUnique({
        where: { whiteboard_id: whiteboard1.whiteboard_id },
      });
      const updated2 = await tx.whiteboard.findUnique({
        where: { whiteboard_id: whiteboard2.whiteboard_id },
      });
      const updated3 = await tx.whiteboard.findUnique({
        where: { whiteboard_id: whiteboard3.whiteboard_id },
      });

      expect(updated1?.whiteboard_order).toBe(2);
      expect(updated2?.whiteboard_order).toBe(1);
      expect(updated3?.whiteboard_order).toBe(0);
    });
  });

  test(`✅ success - reorder single whiteboard.
    - it return { ok: true }.
    - it update the whiteboard_order.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createWhiteboard(tx, operator, {
        whiteboard_order: 0,
      });

      const input: z.infer<typeof WhiteboardRouterSchema.reorderInputList> = [
        {
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_order: 5,
        },
      ];

      // act
      const output = await caller.whiteboard.reorder(input);

      // assert
      expect(output).toEqual({ ok: true });

      // Verify the record is updated in the database
      const updated = await tx.whiteboard.findUnique({
        where: { whiteboard_id: whiteboard.whiteboard_id },
      });
      expect(updated?.whiteboard_order).toBe(5);
    });
  });
});
