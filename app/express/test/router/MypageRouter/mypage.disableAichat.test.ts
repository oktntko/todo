import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.disableAichat`, () => {
  test(`✅ success - disable aichat.
    - it return the updated value.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const current = await tx.user.update({
        where: { user_id: operator.user_id },
        data: {
          aichat_enable: true,
          aichat_api_key: 'valid-key',
          aichat_model: 'gpt-4.1',
        },
      });

      const input = void 0;

      // act
      const output = await caller.mypage.disableAichat(input);

      // assert
      expect(output).toMatchObject({
        aichat_enable: false,
        aichat_model: '',
      });

      const updated = await tx.user.findUniqueOrThrow({
        where: { user_id: operator.user_id },
      });
      expect(updated).toMatchObject({
        ...current,
        aichat_enable: false,
        aichat_api_key: '',
        aichat_model: '',
        updated_at: expect.any(Date),
      });
    });
  });
});
