import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.patchProfile`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator }) => {
          // arrange
          const input: z.infer<typeof MypageRouterSchema.patchProfileInput> = {
            email: operator.email,
            username: 'new_username',
            avatar_image: 'https://example.com/avatar.jpg',
            description: 'New description',
          };

          // act
          const output = await caller.mypage.patchProfile(input);

          // assert
          expect(output).toMatchObject({
            email: operator.email,
            username: 'new_username',
            avatar_image: 'https://example.com/avatar.jpg',
            description: 'New description',
          });
        });
      });

      test(`fail. email already exists`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, tx }) => {
          // arrange
          const anotherUser = await tx.user.create({
            data: {
              email: 'another@test.com',
              password: 'hashed_password',
              username: 'another_user',
              avatar_image: '',
              description: '',
              twofa_enable: false,
              twofa_secret: '',
              aichat_enable: false,
              aichat_model: '',
              aichat_api_key: '',
            },
          });

          const input: z.infer<typeof MypageRouterSchema.patchProfileInput> = {
            email: anotherUser.email, // Duplicate email
            username: 'new_username',
            avatar_image: '',
            description: '',
          };

          // act
          await expect(caller.mypage.patchProfile(input))
            // assert
            .rejects.toThrow(
              new TRPCError({
                code: 'CONFLICT',
                message: message.error.CONFLICT_DUPLICATE_WHEN_UPDATE,
              }),
            );
        });
      });
    });
  });
});
