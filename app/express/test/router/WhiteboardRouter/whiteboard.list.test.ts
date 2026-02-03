import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema';

import { createTestUser, transactionRollbackTrpc } from '../../helper';
import { addTestWhiteboard, createTestSpaceAndAddWhiteboard } from './_WhiteboardRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.list`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - list whiteboards owned by the login user, when operator has $role role.
    - it return whiteboards ordered by whiteboard_order ascending.`,
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

        await createTestSpaceAndAddWhiteboard(tx, operator, role); // 権限はあるが異なる space_id
        await createTestSpaceAndAddWhiteboard(tx, operator, undefined); // 権限がない space_id

        const input: z.infer<typeof WhiteboardRouterSchema.listInput> = {
          space_id: whiteboard1.space_id,
        };

        // act
        const output = await caller.whiteboard.list(input);

        // assert
        expect(output).toHaveLength(3);
        expect(output).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ whiteboard_id: whiteboard1.whiteboard_id }),
            expect.objectContaining({ whiteboard_id: whiteboard2.whiteboard_id }),
            expect.objectContaining({ whiteboard_id: whiteboard3.whiteboard_id }),
          ]),
        );
        // Verify order
        expect(output[0]!.whiteboard_order).toBeLessThan(output[1]!.whiteboard_order);
        expect(output[1]!.whiteboard_order).toBeLessThan(output[2]!.whiteboard_order);
      });
    },
  );

  test(`✅ success - filter by login user.
    - it does not return whiteboards owned by other users.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const other = await createTestUser(tx);

      const whiteboardOther = await createTestSpaceAndAddWhiteboard(tx, other, 'OWNER');

      const input: z.infer<typeof WhiteboardRouterSchema.listInput> = {
        space_id: whiteboardOther.space_id,
      };

      // act
      const output = await caller.whiteboard.list(input);

      // assert
      expect(output).toHaveLength(0);
    });
  });

  test(`✅ success - data not found in database.
      - it does not return whiteboards.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof WhiteboardRouterSchema.listInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
      };

      // act
      const output = await caller.whiteboard.list(input);

      // assert
      expect(output).toHaveLength(0);
    });
  });
});
