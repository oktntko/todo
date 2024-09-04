import { TRPCError } from '@trpc/server';
import type { z } from 'zod';
import { dayjs } from '~/lib/dayjs.js';
import { log } from '~/lib/log4js.js';
import { HashPassword, OnetimePassword, SecretPassword } from '~/lib/secret.js';
import type { PrismaClient } from '~/middleware/prisma.js';
import { SpaceRepository } from '~/repository/SpaceRepository.js';
import { UserRepository } from '~/repository/UserRepository.js';
import { checkDataExist, checkDuplicate } from '~/repository/_repository.js';
import { AuthRouterSchema } from '~/schema/AuthRouterSchema.js';

export const AuthService = {
  signup,
  signin,
  signinTwofa,
};

async function signup(
  reqid: string,
  prisma: PrismaClient,
  input: z.infer<typeof AuthRouterSchema.signupInput>,
) {
  log.trace(reqid, 'signup', input);

  await checkDuplicate({
    duplicate: UserRepository.findUniqueUser(prisma, {
      where: { email: input.email },
    }),
    duplicateIsExistingMessage: 'メールアドレスは既に登録されています。',
  });

  const hashedPassword = HashPassword.hash(input.new_password);

  const user = await UserRepository.createUser(prisma, {
    data: {
      username: input.email,
      email: input.email,
      password: hashedPassword,
    },
  });

  await SpaceRepository.createSpace(prisma, {
    data: {
      owner_id: user.user_id,
      space_name: 'MyTodo',
      space_description: 'This is the default workspace.',
      space_order: 0,
      space_image: '',
    },
    operator_id: user.user_id,
  });

  return user;
}

async function signin(
  reqid: string,
  prisma: PrismaClient,
  input: z.infer<typeof AuthRouterSchema.signinInput>,
) {
  log.trace(reqid, 'signup', input);

  const user = await UserRepository.findUniqueUser(prisma, {
    where: { email: input.email },
  });

  if (!user || !HashPassword.compare(input.password, user.password)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'ログインに失敗しました。メールアドレスが登録されていないか、パスワードが誤っています。',
    });
  }

  return user;
}

async function signinTwofa(
  reqid: string,
  prisma: PrismaClient,
  input: z.infer<typeof AuthRouterSchema.signinTwofaInput> & {
    auth_twofa: {
      expires: Date;
      user_id: number;
    } | null;
  },
) {
  log.trace(reqid, 'signinTwofa', input);

  if (!input.auth_twofa || dayjs(input.auth_twofa.expires).isBefore(dayjs())) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'ログインの有効期限が切れています。最初から操作をやり直してください。',
    });
  }

  const user = await checkDataExist({
    data: UserRepository.findUniqueUser(prisma, {
      where: { user_id: input.auth_twofa.user_id },
    }),
    dataIsNotExistMessage: 'ログインの有効期限が切れています。最初から操作をやり直してください。',
  });

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(user.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'コードが合致しません。',
    });
  }

  return user;
}
