import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.generateSecret`, () => {
  test(`✅ success - generate secret.
    - it return generated QR code.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // act
      const output = await caller.mypage.generateSecret();

      // assert
      expect(output).toHaveProperty('dataurl');
      expect(output.dataurl).toContain('data:image');
    });
  });
});
