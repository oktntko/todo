import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createWhiteboard } from './testWhiteboardRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.upsert`, () => {
  test(`✅ success - create when whiteboard_id is null.
    - it return the created whiteboard.
    - it save the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.upsertInput> = {
        whiteboard_id: null,
        whiteboard_content: '{"test": true}',
      };

      // act
      const output = await caller.whiteboard.upsert(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          whiteboard_content: input.whiteboard_content,
        }),
      );

      // Verify the record is saved in the database
      const created = await tx.whiteboard.findUnique({
        where: { whiteboard_id: output.whiteboard_id },
      });
      expect(created).not.toBeNull();
      expect(created?.whiteboard_content).toBe(input.whiteboard_content);
    });
  });

  test(`✅ success - update when whiteboard_id is provided.
    - it return the updated whiteboard.
    - it update the whiteboard_content only.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard = await createWhiteboard(tx, operator, {
        whiteboard_content: '{}',
      });

      const input: z.infer<typeof WhiteboardRouterSchema.upsertInput> = {
        whiteboard_id: whiteboard.whiteboard_id,
        whiteboard_content: '{"updated": true}',
      };

      // act
      const output = await caller.whiteboard.upsert(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          whiteboard_id: whiteboard.whiteboard_id,
          whiteboard_content: input.whiteboard_content,
        }),
      );

      // Verify the record is updated in the database
      const updated = await tx.whiteboard.findUnique({
        where: { whiteboard_id: whiteboard.whiteboard_id },
      });
      expect(updated?.whiteboard_content).toBe(input.whiteboard_content);
    });
  });
});
