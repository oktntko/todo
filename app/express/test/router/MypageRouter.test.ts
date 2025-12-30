import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { APIError } from 'openai';
import * as externalOpenai from '~/external/openai';
import { message } from '~/lib/message';
import { OnetimePassword } from '~/lib/secret';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { mockopts, transactionRollback, transactionRollbackTrpc } from '../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.get`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator }) => {
          // arrange
          const input = void 0;

          // act
          const output = await caller.mypage.get(input);

          // assert
          expect(output).toMatchObject(MypageRouterSchema.getOutput.parse(operator));
        });
      });
      test(`fail. user is not login.`, async () => {
        return transactionRollback(prisma, async ({ tx }) => {
          const ctx = createContext(mockopts({ user_id: crypto.randomUUID() }), tx);
          const caller = createCaller(ctx);
          // arrange
          const input = void 0;

          // act
          await expect(caller.mypage.get(input))
            // assert
            .rejects.toThrow(
              new TRPCError({
                code: 'UNAUTHORIZED',
                message: message.error.UNAUTHORIZED,
              }),
            );
        });
      });
    });
  });

  describe(`mypage.delete`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
          // arrange
          const input = void 0;

          // act
          await caller.mypage.delete(input);

          // assert
          const deleted = await tx.user.findUnique({
            where: { user_id: operator.user_id },
          });
          expect(deleted).toBeNull();
        });
      });
      test(`fail. user not found in database.`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
          // arrange
          const input = void 0;

          await tx.user.delete({
            where: { user_id: operator.user_id },
          });

          // act
          await expect(caller.mypage.delete(input))
            // assert
            .rejects.toThrow(
              new TRPCError({
                code: 'UNAUTHORIZED',
                message: message.error.UNAUTHORIZED,
              }),
            );
        });
      });
    });
  });

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

  describe(`mypage.generateSecret`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          // act
          const output = await caller.mypage.generateSecret();

          // assert
          expect(output).toHaveProperty('dataurl');
          expect(output.dataurl).toContain('data:image');
        });
      });
    });
  });

  describe(`mypage.enableSecret`, () => {
    describe(`test decision table`, () => {
      test(`fail. setting_twofa not found`, async () => {
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

      test(`fail. invalid token`, async () => {
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

      test(`success.`, async () => {
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
    });
  });

  describe(`mypage.disableSecret`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, tx, operator }) => {
          // arrange
          // Enable 2FA first
          const current = await tx.user.update({
            where: { user_id: operator.user_id },
            data: {
              twofa_enable: true,
              twofa_secret: 'encrypted_secret',
            },
          });

          // act
          await caller.mypage.disableSecret();

          // assert
          const updated = await tx.user.findUniqueOrThrow({
            where: { user_id: operator.user_id },
          });
          expect(updated).toMatchObject({
            ...current,
            twofa_enable: false,
            twofa_secret: '',
            updated_at: expect.any(Date),
          });
        });
      });
    });
  });

  describe(`mypage.patchAichat`, () => {
    describe(`test decision table`, () => {
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
  });
});
