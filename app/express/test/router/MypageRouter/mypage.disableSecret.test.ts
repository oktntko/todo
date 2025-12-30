import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.disableSecret`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, tx, operator }) => {
          // arrange
          // Enable 2FA first
          const current = await tx.user.update({
            where: { user_id: operator.user_id },
            data: {
              twofa_enable: true,
              twofa_secret: 'encrypted_secret',
            },
          });

          // act
          await caller.mypage.disableSecret();

          // assert
          const updated = await tx.user.findUniqueOrThrow({
            where: { user_id: operator.user_id },
          });
          expect(updated).toMatchObject({
            ...current,
            twofa_enable: false,
            twofa_secret: '',
            updated_at: expect.any(Date),
          });
        });
      });
    });
  });
});
