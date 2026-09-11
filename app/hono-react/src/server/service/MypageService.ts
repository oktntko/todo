import type { z } from '@todo/lib';

import { dayjs } from '@todo/lib';
import { HTTPException } from 'hono/http-exception';

import type { Operator, OperatorMinimum } from '@/middleware/auth';
import type { PrismaClient } from '@/middleware/prisma';

import { ReqCtx } from '@/lib/context';
import { HashPassword, OnetimePassword, SecretPassword } from '@/lib/secret';
import { StatusCode } from '@/middleware/hono';
import { _repository } from '@/repository/_repository';
import { UserRepository } from '@/repository/UserRepository';
import { MypageRouterSchema } from '@/schema/MypageRouterSchema';

export const MypageService = {
  deleteMypage,
  patchPassword,
  patchProfile,
  generateSecret,
  enableSecret,
  disableSecret,
};

// mypage.deleteMypage
async function deleteMypage({ ...ctx }: { prisma: PrismaClient; operator: OperatorMinimum }) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'deleteProfile');

  await UserRepository.deleteUser(ctx.prisma, {
    where: { user_id: ctx.operator.user_id },
  });

  return { ok: true } as const;
}

// mypage.patchPassword
async function patchPassword({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: Operator;
  input: z.infer<typeof MypageRouterSchema.patchPasswordInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'patchPassword');

  // 現在のパスワードの確認
  if (!HashPassword.compare(input.current_password, ctx.operator.password)) {
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message: 'Your current password is incorrect. Please try again.',
    });
  }
  // 新しいパスワードをハッシュ化
  const hashedPassword = HashPassword.hash(input.new_password);

  return UserRepository.updateUser(ctx.prisma, {
    data: { password: hashedPassword },
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.patchProfile
async function patchProfile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof MypageRouterSchema.patchProfileInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'patchProfile');

  await _repository.checkDuplicate({
    duplicate: UserRepository.findUniqueUser(ctx.prisma, { where: { email: input.email } }),
    current: { key: 'user_id', value: ctx.operator.user_id },
  });

  return UserRepository.updateUser(ctx.prisma, {
    data: input,
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.generateSecret
async function generateSecret({ ...ctx }: { prisma: PrismaClient; operator: Operator }) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'generateSecret');

  const secret = OnetimePassword.generateSecret({ name: ctx.operator.email });

  const dataurl = await OnetimePassword.generateQrcodeUrl({
    secret: secret.ascii,
    name: ctx.operator.email,
  });

  // セッションに生成したシークレットを保存する
  const setting_twofa = {
    expires: dayjs().add(12, 'hour').toDate(),
    twofa_secret: SecretPassword.encrypt(secret.base32),
  };

  return { dataurl, setting_twofa };
}

// mypage.enableSecret
async function enableSecret({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof MypageRouterSchema.enableSecretInput> & {
    setting_twofa: {
      expires: Date;
      twofa_secret: string;
    } | null;
  };
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'enableSecret');

  if (!input.setting_twofa || dayjs(input.setting_twofa.expires).isBefore(dayjs())) {
    // setting_twofa がないのは generateSecret が実行されていない場合（またはセッションがリセットされた場合）。
    // 通常の操作では起こりづらいため、有効期限がきれていることだけ伝える。
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message:
        'Your two-factor authentication setup has expired. Please start the setup process again.',
    });
  }

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(input.setting_twofa.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message: 'Invalid authentication code. Please try again.',
    });
  }

  return UserRepository.updateUser(ctx.prisma, {
    data: { twofa_enable: true, twofa_secret: input.setting_twofa.twofa_secret },
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.disableSecret
async function disableSecret({ ...ctx }: { prisma: PrismaClient; operator: OperatorMinimum }) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'disableSecret');

  return UserRepository.updateUser(ctx.prisma, {
    data: { twofa_enable: false, twofa_secret: '' },
    where: { user_id: ctx.operator.user_id },
  });
}
