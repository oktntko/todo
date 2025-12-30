import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.generateSecret`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          // act
          const output = await caller.mypage.generateSecret();

          // assert
          expect(output).toHaveProperty('dataurl');
          expect(output.dataurl).toContain('data:image');
        });
      });
    });
  });
});
