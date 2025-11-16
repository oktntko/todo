import { z } from '@todo/lib/zod';
import { UserSchema } from '@todo/prisma/schema';

const signupInput = UserSchema.pick({
  email: true,
})
  .extend({
    new_password: z.string().trim().min(8).max(255),
    confirm: z.string().trim().min(1).max(255),
  })
  .refine((data) => data.new_password === data.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

const signinInput = UserSchema.pick({
  email: true,
  password: true,
});

const signinTwofaInput = z.object({
  token: z.string().length(6),
});

export const AuthRouterSchema = {
  signupInput,
  signinInput,
  signinTwofaInput,
};

export const AuthSchema = z.object({ auth: z.boolean() });
