import { dayjs } from '@todo/lib/dayjs';
import type { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import OpenAI, { APIError } from 'openai';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { HashPassword, OnetimePassword, SecretPassword } from '~/lib/secret';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { UserRepository } from '~/repository/UserRepository';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';

export const MypageService = {
  deleteMypage,
  patchPassword,
  patchProfile,
  generateSecret,
  enableSecret,
  disableSecret,
  patchAichat,
};

// mypage.deleteMypage
async function deleteMypage(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'deleteProfile', ctx.operator.user_id);

  await UserRepository.deleteUser(ctx.prisma, {
    where: { user_id: ctx.operator.user_id },
  });

  return { ok: true } as const;
}

// mypage.patchPassword
async function patchPassword(
  ctx: ProtectedContext,
  input: z.infer<typeof MypageRouterSchema.patchPasswordInput>,
) {
  log.trace(ReqCtx.reqid, 'patchPassword', ctx.operator.user_id, input);

  // 現在のパスワードの確認
  if (!HashPassword.compare(input.current_password, ctx.operator.password)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
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
async function patchProfile(
  ctx: ProtectedContext,
  input: z.infer<typeof MypageRouterSchema.patchProfileInput>,
) {
  log.trace(ReqCtx.reqid, 'updateProfile', ctx.operator.user_id, input);

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
async function generateSecret(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'generateSecret', ctx.operator.user_id);

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
async function enableSecret(
  ctx: ProtectedContext,
  input: z.infer<typeof MypageRouterSchema.enableSecretInput> & {
    setting_twofa: {
      expires: Date;
      twofa_secret: string;
    } | null;
  },
) {
  log.trace(ReqCtx.reqid, 'enableSecret', ctx.operator.user_id, input);

  if (!input.setting_twofa || dayjs(input.setting_twofa.expires).isBefore(dayjs())) {
    // setting_twofa がないのは generateSecret が実行されていない場合（またはセッションがリセットされた場合）。
    // 通常の操作では起こりづらいため、有効期限がきれていることだけ伝える。
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'Your two-factor authentication setup has expired. Please start the setup process again.',
    });
  }

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(input.setting_twofa.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid authentication code. Please try again.',
    });
  }

  return UserRepository.updateUser(ctx.prisma, {
    data: { twofa_enable: true, twofa_secret: input.setting_twofa.twofa_secret },
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.disableSecret
async function disableSecret(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'disableSecret', ctx.operator.user_id);

  return UserRepository.updateUser(ctx.prisma, {
    data: { twofa_enable: false, twofa_secret: '' },
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.patchAichat
async function patchAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof MypageRouterSchema.patchAichatInput>,
) {
  log.trace(ReqCtx.reqid, 'patchAichat', ctx.operator.user_id);

  if (input.aichat_enable) {
    // OpenAI には「APIキーを検証する専用API」は存在しないため、軽い API コールを 1 回実行して、成功/失敗で判断する
    try {
      const openai = new OpenAI({ apiKey: input.aichat_api_key });
      await openai.models.list();
    } catch (e) {
      if (e instanceof APIError && (e.status === 401 || e.status === 403)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The AI chat API key is invalid. Please check and try again.',
        });
      }

      log.error(ReqCtx.reqid, 'patchAichat', 'OpenAI API key validation failed', e);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The service is temporarily unavailable. Please try again in a moment.',
      });
    }
  }

  return UserRepository.updateUser(ctx.prisma, {
    data: {
      aichat_enable: input.aichat_enable,
      aichat_api_key: input.aichat_enable ? SecretPassword.encrypt(input.aichat_api_key) : '',
      aichat_model: input.aichat_enable ? input.aichat_model : '',
    },
    where: { user_id: ctx.operator.user_id },
  });
}
