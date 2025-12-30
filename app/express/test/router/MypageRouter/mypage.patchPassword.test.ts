import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.patchPassword`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator }) => {
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
        });
      });

      test(`fail. current password incorrect`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          // arrange
          const input: z.infer<typeof MypageRouterSchema.patchPasswordInput> = {
            current_password: 'wrong_password',
            new_password: 'new_password_456',
            confirm: 'new_password_456',
          };

          // act
          await expect(caller.mypage.patchPassword(input))
            // assert
            .rejects.toThrow(
              new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Your current password is incorrect. Please try again.',
              }),
            );
        });
      });

      test(`fail. passwords do not match`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          // arrange
          const input = {
            current_password: 'password123',
            new_password: 'new_password_456',
            confirm: 'different_password',
          };

          // act
          await expect(caller.mypage.patchPassword(input))
            // assert
            .rejects.toThrowError(
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
  });
});
