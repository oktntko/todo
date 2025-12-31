import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';
import { createWhiteboard } from './testWhiteboardRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.list`, () => {
  test(`✅ success - list whiteboards owned by the login user.
    - it return whiteboards ordered by whiteboard_order ascending.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const whiteboard1 = await createWhiteboard(tx, operator, { whiteboard_order: 0 });
      const whiteboard2 = await createWhiteboard(tx, operator, { whiteboard_order: 1 });
      const whiteboard3 = await createWhiteboard(tx, operator, { whiteboard_order: 2 });

      // act
      const output = await caller.whiteboard.list();

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
  });

  test(`✅ success - filter by login user.
    - it only return whiteboards owned by the login user.
    - it does not return whiteboards owned by other users.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const other = await tx.user.create({
        data: {
          user_id: '019b7403-f2c4-73ee-92c7-045f7a9b842e',
          username: 'other.user',
          email: 'other.user@example.com',
          password: 'password.other.user@example.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const whiteboardOperator = await createWhiteboard(tx, operator);
      const whiteboardOther = await createWhiteboard(tx, other);

      // act
      const output = await caller.whiteboard.list();

      // assert
      expect(output).toHaveLength(1);
      expect(output[0]).toEqual(
        expect.objectContaining({ whiteboard_id: whiteboardOperator.whiteboard_id }),
      );
      expect(output).not.toContainEqual(
        expect.objectContaining({ whiteboard_id: whiteboardOther.whiteboard_id }),
      );
    });
  });
});
