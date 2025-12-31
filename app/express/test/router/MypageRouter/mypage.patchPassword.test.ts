import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.patchPassword`, () => {
  test(`✅ success - change password.
    - it return the updated value.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
      // arrange
      const input: z.infer<typeof MypageRouterSchema.patchPasswordInput> = {
        current_password: 'test@example.com',
        new_password: 'new_password_456',
        confirm: 'new_password_456',
      };

      // act
      const output = await caller.mypage.patchPassword(input);

      // assert
      expect(output).toMatchObject({
        email: operator.email,
        username: operator.username,
      });

      const updated = await tx.user.findUniqueOrThrow({
        where: { user_id: operator.user_id },
      });
      expect(updated).toMatchObject({
        ...operator,
        password: expect.any(String),
        updated_at: expect.any(Date),
      });
    });
  });

  test(`⚠️ validation error - input incorrect current password.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof MypageRouterSchema.patchPasswordInput> = {
        current_password: 'wrong_password',
        new_password: 'new_password_456',
        confirm: 'new_password_456',
      };

      // act & assert
      await expect(caller.mypage.patchPassword(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your current password is incorrect. Please try again.',
        }),
      );
    });
  });

  test(`⚠️ validation error - input passwords do not match.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input = {
        current_password: 'password123',
        new_password: 'new_password_456',
        confirm: 'different_password',
      };

      // act & assert
      await expect(caller.mypage.patchPassword(input)).rejects.toThrowError(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: JSON.stringify(
            [
              {
                code: 'custom',
                path: ['confirm'],
                message: 'Passwords do not match.',
              },
            ],
            null,
            2,
          ),
        }),
      );
    });
  });
});
