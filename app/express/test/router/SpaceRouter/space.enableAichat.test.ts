import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { APIError } from 'openai';

import * as externalOpenai from '~/external/openai';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.enableAichat`, () => {
  test(`✅ success - enable aichat.
    - it return the updated value.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
        aichat_enable: false,
        aichat_api_key: '',
      });

      // @ts-expect-error mocking
      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        return {
          models: {
            list: vi.fn().mockResolvedValueOnce({}),
          },
        };
      });

      const input: z.infer<typeof SpaceRouterSchema.enableAichatInput> = {
        space_id: space.space_id,
        updated_at: space.updated_at,
        aichat_api_key: 'valid-key',
      };

      // act
      const output = await caller.space.enableAichat(input);

      // assert
      expect(output).toMatchObject({
        aichat_enable: true,
      });

      const updated = await tx.space.findUniqueOrThrow({
        where: { space_id: space.space_id },
      });
      expect(updated).toMatchObject({
        ...space,
        aichat_enable: true,
        aichat_api_key: expect.any(String),
        updated_by: operator.user_id,
        updated_at: expect.any(Date),
      });

      mockOpenAI.mockRestore();
    });
  });

  test(`⚠️ validation error - input invalid api key. openai throw 401 error.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
        aichat_enable: false,
        aichat_api_key: '',
      });

      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new APIError(401, undefined, 'Unauthorized', undefined);
      });

      const input: z.infer<typeof SpaceRouterSchema.enableAichatInput> = {
        space_id: space.space_id,
        updated_at: space.updated_at,
        aichat_api_key: 'invalid-key',
      };

      // act & assert
      await expect(caller.space.enableAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });

  test(`⚠️ validation error - input invalid api key. openai throw 403 error.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
        aichat_enable: false,
        aichat_api_key: '',
      });

      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new APIError(403, undefined, 'Forbidden', undefined);
      });

      const input: z.infer<typeof SpaceRouterSchema.enableAichatInput> = {
        space_id: space.space_id,
        updated_at: space.updated_at,
        aichat_api_key: 'invalid-key',
      };

      // act & assert
      await expect(caller.space.enableAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });

  test(`❗ system error - happened unexpected error when verify openai api key.
    - it throw BAD_GATEWAY error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
        aichat_enable: false,
        aichat_api_key: '',
      });

      const mockOpenAI = vi.spyOn(externalOpenai, 'newOpenAI').mockImplementationOnce(() => {
        throw new Error('Internal Server Error');
      });

      const input: z.infer<typeof SpaceRouterSchema.enableAichatInput> = {
        space_id: space.space_id,
        updated_at: space.updated_at,
        aichat_api_key: 'invalid-key',
      };

      // act & assert
      await expect(caller.space.enableAichat(input)).rejects.toThrow(
        new TRPCError({
          code: 'BAD_GATEWAY',
          message: 'The service is temporarily unavailable. Please try again in a moment.',
        }),
      );

      mockOpenAI.mockRestore();
    });
  });
});
