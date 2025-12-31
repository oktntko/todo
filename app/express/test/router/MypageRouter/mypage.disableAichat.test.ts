import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { APIError } from 'openai';
import * as externalOpenai from '~/external/openai';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.patchAichat`, () => {
  test(`✅ success - enable aichat.
    - it returns the updated value.
    - it updates the record in the database. `, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const current = await tx.user.update({
        where: { user_id: operator.user_id },
        data: {
          aichat_enable: false,
          aichat_api_key: '',
          aichat_model: '',
        },
      });

      // @ts-expect-error mocking
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        return {
          models: {
            list: vi.fn().mockResolvedValueOnce({}),
          },
        };
      });

      const input: z.infer<typeof MypageRouterSchema.enableAichatInput> = {
        aichat_api_key: 'valid-key',
      };

      // act
      const output = await caller.mypage.enableAichat(input);

      // assert
      expect(output).toMatchObject({
        aichat_enable: true,
      });

      const updated = await tx.user.findUniqueOrThrow({
        where: { user_id: operator.user_id },
      });
      expect(updated).toMatchObject({
        ...current,
        aichat_enable: true,
        aichat_api_key: expect.any(String), //
        updated_at: expect.any(Date),
      });

      mockOpenAI.mockRestore();
    });
  });

  test(`❗ fail - input invalid api key. openai throw 401 error.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new APIError(401, undefined, 'Unauthorized', undefined);
      });

      const input: z.infer<typeof MypageRouterSchema.enableAichatInput> = {
        aichat_api_key: 'invalid-key',
      };

      // act & assert
      await expect(caller.mypage.enableAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });

  test(`❗ fail - input invalid api key. openai throw 403 error.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new APIError(403, undefined, 'Forbidden', undefined);
      });

      const input: z.infer<typeof MypageRouterSchema.enableAichatInput> = {
        aichat_api_key: 'invalid-key',
      };

      // act & assert
      await expect(caller.mypage.enableAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });

  test(`❗ fail - happened unexpected error when verify openai api key.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new Error('Internal Server Error');
      });

      const input: z.infer<typeof MypageRouterSchema.enableAichatInput> = {
        aichat_api_key: 'invalid-key',
      };

      // act & assert
      await expect(caller.mypage.enableAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The service is temporarily unavailable. Please try again in a moment.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });
});
