import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.delete`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
          // arrange
          const input = void 0;

          // act
          await caller.mypage.delete(input);

          // assert
          const deleted = await tx.user.findUnique({
            where: { user_id: operator.user_id },
          });
          expect(deleted).toBeNull();
        });
      });
      test(`fail. user not found in database.`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
          // arrange
          const input = void 0;

          await tx.user.delete({
            where: { user_id: operator.user_id },
          });

          // act
          await expect(caller.mypage.delete(input))
            // assert
            .rejects.toThrow(
              new TRPCError({
                code: 'UNAUTHORIZED',
                message: message.error.UNAUTHORIZED,
              }),
            );
        });
      });
    });
  });
});
