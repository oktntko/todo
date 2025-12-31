import { z } from '@todo/lib/zod';
import { UserSchema } from '@todo/prisma/schema';

const patchProfileInput = UserSchema.pick({
  username: true,
  email: true,
  avatar_image: true,
  description: true,
  aichat_model: true,
});

const patchPasswordInput = z
  .object({
    current_password: z.string().trim().min(8).max(255),
    new_password: z.string().trim().min(8).max(255),
    confirm: z.string().trim().min(1).max(255),
  })
  .refine((data) => data.new_password === data.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

const enableSecretInput = z.object({
  token: z.string().length(6),
});

const enableAichatInput = UserSchema.pick({
  aichat_api_key: true,
});

const getOutput = UserSchema.pick({
  email: true,
  username: true,
  avatar_image: true,
  description: true,
  twofa_enable: true,
  aichat_enable: true,
  aichat_model: true,
});

export const MypageRouterSchema = {
  patchProfileInput,
  patchPasswordInput,
  enableSecretInput,
  enableAichatInput,
  getOutput,
};
