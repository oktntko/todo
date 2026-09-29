import type { z } from '@todo/lib';
import { dayjs } from '@todo/lib';
import { SpaceUserRole } from '@todo/prisma/client';
import { HTTPException } from 'hono/http-exception';

import { ReqCtx } from '@/app/api/lib/context';
import { HashPassword, OnetimePassword, SecretPassword } from '@/app/api/lib/secret';
import { StatusCode } from '@/app/api/middleware/hono';
import type { PrismaClient } from '@/app/api/middleware/prisma';
import { _repository } from '@/app/api/repository/_repository';
import { SpaceRepository } from '@/app/api/repository/SpaceRepository';
import { UserRepository } from '@/app/api/repository/UserRepository';
import { AuthRouterSchema } from '@/app/api/schema/AuthRouterSchema';

export const AuthService = {
  signup,
  signin,
  signinTwofa,
};

// auth.signup
async function signup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  input: z.infer<typeof AuthRouterSchema.signupInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid }, 'signup'); // input secret

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

  await SpaceRepository.createSpace(ctx.prisma, {
    operator_id: user.user_id,
    data: {
      space_name: 'MySpace',
      space_description: 'This is the default workspace.',
      space_image: '',
      space_color: '',

      space_user_list: {
        create: {
          role: SpaceUserRole.OWNER,
          user_id: user.user_id,
        },
      },

      group_list: {
        create: {
          group_name: 'MyGroup',
          group_description: 'This is the default group.',
          group_order: 0,
          group_image: '',
          group_color: '',
          created_by: user.user_id,
          updated_by: user.user_id,

          todo_list: {
            create: {
              title: 'MyTodo',
              description: 'This is the default todo.',
              order: 0,
              created_by: user.user_id,
              updated_by: user.user_id,
            },
          },
        },
      },
    },
  });

  return user;
}

// auth.signin
async function signin({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  input: z.infer<typeof AuthRouterSchema.signinInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid }, 'signin'); // input secret

  const user = await UserRepository.findUniqueUser(ctx.prisma, {
    where: { email: input.email },
  });

  if (!user || !HashPassword.compare(input.password, user.password)) {
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message: 'The email or password you entered is incorrect.',
      // TODO: 連続失敗時にアカウントロックや CAPTCHA を組み合わせる。
    });
  }

  return user;
}

// auth.signinTwofa
async function signinTwofa({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  input: z.infer<typeof AuthRouterSchema.signinTwofaInput> & {
    user_id: string;
    exp: number;
  };
}) {
  console.debug({ reqid: ReqCtx.reqid }, 'signinTwofa'); // input secret

  if (!input.exp || dayjs(input.exp).isBefore(dayjs())) {
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message: 'Your authentication session has expired. Please sign in again.',
    });
  }

  const user = await _repository.checkDataExist({
    data: UserRepository.findUniqueUser(ctx.prisma, {
      where: { user_id: input.user_id },
    }),
    dataIsNotExistMessage: 'Your authentication session has expired. Please sign in again.',
  });

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(user.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message: 'Invalid authentication code. Please try again.',
    });
  }

  return user;
}
