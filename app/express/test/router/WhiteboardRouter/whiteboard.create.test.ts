import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.create`, () => {
  test(`✅ success - create a new whiteboard.
    - it return the created whiteboard.
    - it save the record in the database.
    - it assign whiteboard_order automatically.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        whiteboard_name: 'test whiteboard',
        whiteboard_description: 'test description',
        whiteboard_content: '{}',
      };

      // act
      const output = await caller.whiteboard.create(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          whiteboard_name: input.whiteboard_name,
          whiteboard_description: input.whiteboard_description,
          whiteboard_content: input.whiteboard_content,
          owner_id: operator.user_id,
        }),
      );

      // Verify the record is saved in the database
      const created = await tx.whiteboard.findUnique({
        where: { whiteboard_id: output.whiteboard_id },
      });
      expect(created).not.toBeNull();
      expect(created).toEqual(expect.objectContaining({ whiteboard_name: input.whiteboard_name }));
    });
  });

  test(`✅ success - whiteboard_order is assigned correctly.
    - when creating the first whiteboard, whiteboard_order should be 0.
    - when creating the second whiteboard, whiteboard_order should be 1.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input1: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        whiteboard_name: 'first whiteboard',
        whiteboard_description: '',
        whiteboard_content: '{}',
      };

      const input2: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        whiteboard_name: 'second whiteboard',
        whiteboard_description: '',
        whiteboard_content: '{}',
      };

      // act
      const output1 = await caller.whiteboard.create(input1);
      const output2 = await caller.whiteboard.create(input2);

      // assert
      expect(output1.whiteboard_order).toBe(0);
      expect(output2.whiteboard_order).toBe(1);
    });
  });
});
