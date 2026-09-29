import type { z } from '@todo/lib';
import { HTTPException } from 'hono/http-exception';

import { ReqCtx } from '@/app/api/lib/context';
import { HashPassword, OnetimePassword, SecretPassword } from '@/app/api/lib/secret';
import type { Operator, OperatorMinimum } from '@/app/api/middleware/auth';
import { StatusCode } from '@/app/api/middleware/hono';
import type { PrismaClient } from '@/app/api/middleware/prisma';
import { _repository } from '@/app/api/repository/_repository';
import { UserRepository } from '@/app/api/repository/UserRepository';
import { MypageRouterSchema } from '@/app/api/schema/MypageRouterSchema';

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

  const twofa_secret = SecretPassword.encrypt(secret.base32);

  return { dataurl, twofa_secret };
}

// mypage.enableSecret
async function enableSecret({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof MypageRouterSchema.enableSecretInput> & {
    twofa_secret: string;
  };
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'enableSecret');

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(input.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new HTTPException(StatusCode.BAD_REQUEST, {
      message: 'Invalid authentication code. Please try again.',
    });
  }

  return UserRepository.updateUser(ctx.prisma, {
    data: { twofa_enable: true, twofa_secret: input.twofa_secret },
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
