import { dayjs } from '@todo/lib/dayjs';
import type { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import OpenAI from 'openai';
import { log } from '~/lib/log4js';
import { HashPassword, OnetimePassword, SecretPassword } from '~/lib/secret';
import { ProtectedContext } from '~/middleware/trpc';
import { checkDataExist, checkDuplicate } from '~/repository/_repository';
import { UserRepository } from '~/repository/UserRepository';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';

export const MypageService = {
  getMypage,
  deleteMypage,
  patchPassword,
  patchProfile,
  generateSecret,
  enableSecret,
  disableSecret,
  patchAichat,
};

// mypage.get
async function getMypage(ctx: ProtectedContext) {
  log.trace(ctx.reqid, 'getMypage', ctx.operator.user_id);

  return checkDataExist({
    data: UserRepository.findUniqueUser(ctx.prisma, {
      where: { user_id: ctx.operator.user_id },
    }),
  });
}

// mypage.deleteMypage
async function deleteMypage(ctx: ProtectedContext) {
  log.trace(ctx.reqid, 'deleteProfile', ctx.operator.user_id);

  return UserRepository.deleteUser(ctx.prisma, { where: { user_id: ctx.operator.user_id } });
}

// mypage.patchPassword
async function patchPassword(
  ctx: ProtectedContext,
  input: z.infer<typeof MypageRouterSchema.patchPasswordInput>,
) {
  log.trace(ctx.reqid, 'patchPassword', ctx.operator.user_id, input);

  // 現在のパスワードの確認
  if (!HashPassword.compare(input.current_password, ctx.operator.password)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'パスワードが誤っています。',
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
  log.trace(ctx.reqid, 'updateProfile', ctx.operator.user_id, input);

  await checkDuplicate({
    duplicate: UserRepository.findUniqueUser(ctx.prisma, { where: { email: ctx.operator.email } }),
    current: { key: 'user_id', value: ctx.operator.user_id },
  });

  return UserRepository.updateUser(ctx.prisma, {
    data: input,
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.generateSecret
async function generateSecret(ctx: ProtectedContext) {
  log.trace(ctx.reqid, 'generateSecret', ctx.operator.user_id);

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
  log.trace(ctx.reqid, 'enableSecret', ctx.operator.user_id, input);

  if (!input.setting_twofa || dayjs(input.setting_twofa.expires).isBefore(dayjs())) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '二要素認証のQRコードが発行されていないか、QRコードの有効期限が切れています。',
    });
  }

  const verified = OnetimePassword.verifyToken({
    secret: SecretPassword.decrypt(input.setting_twofa.twofa_secret),
    token: input.token,
  });

  if (!verified) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'コードが合致しません。' });
  }

  return UserRepository.updateUser(ctx.prisma, {
    data: { twofa_enable: true, twofa_secret: input.setting_twofa.twofa_secret },
    where: { user_id: ctx.operator.user_id },
  });
}

// mypage.disableSecret
async function disableSecret(ctx: ProtectedContext) {
  log.trace(ctx.reqid, 'disableSecret', ctx.operator.user_id);

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
  log.trace(ctx.reqid, 'patchAichat', ctx.operator.user_id);

  if (input.aichat_enable) {
    const openai = new OpenAI({ apiKey: input.aichat_api_key });
    const response = await openai.chat.completions.create({
      model: input.aichat_model,
      messages: [
        {
          role: 'user',
          content: 'test',
        },
      ],
    });

    if (response.choices.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'API失敗',
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
