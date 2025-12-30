import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { APIError } from 'openai';
import * as externalOpenai from '~/external/openai';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.patchAichat`, () => {
  test(`success - disable aichat`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof MypageRouterSchema.patchAichatInput> = {
        aichat_enable: false,
        aichat_api_key: '',
        aichat_model: '',
      };

      // act
      const output = await caller.mypage.patchAichat(input);

      // assert
      expect(output).toMatchObject({
        aichat_enable: false,
        aichat_model: '',
      });
    });
  });

  test(`success - enable aichat`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      // @ts-expect-error mocking
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        return {
          models: {
            list: vi.fn().mockResolvedValueOnce({}),
          },
        };
      });

      const input: z.infer<typeof MypageRouterSchema.patchAichatInput> = {
        aichat_enable: true,
        aichat_api_key: 'invalid-key',
        aichat_model: 'gpt-4.1',
      };

      // act
      const output = await caller.mypage.patchAichat(input);

      // assert
      expect(output).toMatchObject({
        aichat_enable: true,
        aichat_model: 'gpt-4.1',
      });

      mockOpenAI.mockRestore();
    });
  });

  test(`fail. invalid api key 401`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new APIError(401, undefined, 'Unauthorized', undefined);
      });

      const input: z.infer<typeof MypageRouterSchema.patchAichatInput> = {
        aichat_enable: true,
        aichat_api_key: 'invalid-key',
        aichat_model: 'gpt-4.1',
      };

      // act & assert
      await expect(caller.mypage.patchAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });

  test(`fail. invalid api key 403`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new APIError(403, undefined, 'Forbidden', undefined);
      });

      const input: z.infer<typeof MypageRouterSchema.patchAichatInput> = {
        aichat_enable: true,
        aichat_api_key: 'invalid-key',
        aichat_model: 'gpt-4.1',
      };

      // act & assert
      await expect(caller.mypage.patchAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });

  test(`fail. invalid api key 500`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new Error('Internal Server Error');
      });

      const input: z.infer<typeof MypageRouterSchema.patchAichatInput> = {
        aichat_enable: true,
        aichat_api_key: 'invalid-key',
        aichat_model: 'gpt-4.1',
      };

      // act & assert
      await expect(caller.mypage.patchAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The service is temporarily unavailable. Please try again in a moment.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });
});
