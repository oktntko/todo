import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.patchProfile`, () => {
  test(`✅ success - change profile.
    - it return the updated value.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
      // arrange
      const input: z.infer<typeof MypageRouterSchema.patchProfileInput> = {
        email: 'change' + operator.email,
        username: 'new_username',
        avatar_image: 'https://example.com/avatar.jpg',
        description: 'New description',
        aichat_model: 'gpt-4.1',
      };

      // act
      const output = await caller.mypage.patchProfile(input);

      // assert
      expect(output).toMatchObject(input);

      const updated = await tx.user.findUniqueOrThrow({
        where: { user_id: operator.user_id },
      });
      expect(updated).toMatchObject({
        ...operator,
        ...input,
        updated_at: expect.any(Date),
      });
    });
  });

  test(`⚠️ business rule violation - input email already exist.
    - it throw CONFLICT error.`, async () => {
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
        aichat_model: '',
      };

      // act & assert
      await expect(caller.mypage.patchProfile(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_DUPLICATE_WHEN_UPDATE,
        }),
      );
    });
  });
});
