import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { OnetimePassword } from '~/lib/secret';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.enableSecret`, () => {
  test(`✅ success - enable 2FA.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      // Disable 2FA first
      const current = await tx.user.update({
        where: { user_id: operator.user_id },
        data: {
          twofa_enable: false,
          twofa_secret: '',
        },
      });

      // Generate secret first
      await caller.mypage.generateSecret();

      const mockOnetimePassword = vi.spyOn(OnetimePassword, 'verifyToken');
      mockOnetimePassword.mockResolvedValueOnce(true);

      const input: z.infer<typeof MypageRouterSchema.enableSecretInput> = {
        token: '000000',
      };

      // act
      await caller.mypage.enableSecret(input);

      // assert
      const updated = await tx.user.findUniqueOrThrow({
        where: { user_id: operator.user_id },
      });
      expect(updated).toMatchObject({
        ...current,
        twofa_enable: true,
        twofa_secret: expect.any(String),
        updated_at: expect.any(Date),
      });
    });
  });

  test(`⚠️ business rule violation - authentication setup has expired.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof MypageRouterSchema.enableSecretInput> = {
        token: '000000',
      };

      // act & assert
      await expect(caller.mypage.enableSecret(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Your two-factor authentication setup has expired. Please start the setup process again.',
        }),
      );
    });
  });

  test(`⚠️ validation error - input invalid token.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      // Generate secret first
      await caller.mypage.generateSecret();

      const input: z.infer<typeof MypageRouterSchema.enableSecretInput> = {
        token: '000000', // Invalid token
      };

      // act & assert
      await expect(caller.mypage.enableSecret(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid authentication code. Please try again.',
        }),
      );
    });
  });
});
