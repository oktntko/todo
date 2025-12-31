import { dayjs } from '@todo/lib/dayjs';
import type { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { HashPassword, OnetimePassword, SecretPassword } from '~/lib/secret';
import { PublicContext } from '~/middleware/trpc';
import { GroupRepository } from '~/repository/GroupRepository';
import { UserRepository } from '~/repository/UserRepository';
import { _repository } from '~/repository/_repository';
import { AuthRouterSchema } from '~/schema/AuthRouterSchema';

export const AuthService = {
  signup,
  signin,
  signinTwofa,
};

// auth.signup
async function signup(ctx: PublicContext, input: z.infer<typeof AuthRouterSchema.signupInput>) {
  log.trace(ReqCtx.reqid, 'signup', input);

  await _repository.checkDuplicate({
    duplicate: UserRepository.findUniqueUser(ctx.prisma, {
      where: { email: input.email },
    }),
    duplicateIsExistingMessage: 'Email address already in use.',
    // TODO: メールアドレスの登録有無を返すメッセージは、攻撃者にとって ユーザー列挙（User Enumeration） の手がかりになる。
    // 登録されていてもされていなくても同じルートを通す。
    // メール認証 => パスワード設定のフローに変更する際に対応する。
  });

  const hashedPassword = HashPassword.hash(input.new_password);

  const user = await UserRepository.createUser(ctx.prisma, {
    data: {
      username: input.email,
      email: input.email,
      password: hashedPassword,
    },
  });

  await GroupRepository.createGroup(ctx.prisma, {
    data: {
      owner_id: user.user_id,
      group_name: 'MyTodo',
      group_description: 'This is the default workgroup.',
      group_order: 0,
      group_image: '',
    },
    operator_id: user.user_id,
  });

  return user;
}

// auth.signin
async function signin(ctx: PublicContext, input: z.infer<typeof AuthRouterSchema.signinInput>) {
  log.trace(ReqCtx.reqid, 'signup', input);

  const user = await UserRepository.findUniqueUser(ctx.prisma, {
    where: { email: input.email },
  });

  if (!user || !HashPassword.compare(input.password, user.password)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'The email or password you entered is incorrect.',
      // TODO: 連続失敗時にアカウントロックや CAPTCHA を組み合わせる。
    });
  }

  return user;
}

// auth.signinTwofa
async function signinTwofa(
  ctx: PublicContext,
  input: z.infer<typeof AuthRouterSchema.signinTwofaInput> & {
    auth_twofa: {
      expires: Date;
      user_id: string;
    } | null;
  },
) {
  log.trace(ReqCtx.reqid, 'signinTwofa', input);

  if (!input.auth_twofa || dayjs(input.auth_twofa.expires).isBefore(dayjs())) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Your authentication session has expired. Please sign in again.',
    });
  }

  const user = await _repository.checkDataExist({
    data: UserRepository.findUniqueUser(ctx.prisma, {
      where: { user_id: input.auth_twofa.user_id },
    }),
    dataIsNotExistMessage: 'Your authentication session has expired. Please sign in again.',
  });

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(user.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid authentication code. Please try again.',
    });
  }

  return user;
}
