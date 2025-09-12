import { dayjs } from '@todo/lib/dayjs';
import type { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { log } from '~/lib/log4js';
import { HashPassword, OnetimePassword, SecretPassword } from '~/lib/secret';
import { type PrismaClient } from '~/middleware/prisma';
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
};

// mypage.get
async function getMypage(reqid: string, prisma: PrismaClient, operator_id: number) {
  log.trace(reqid, 'getMypage', operator_id);

  return checkDataExist({
    data: UserRepository.findUniqueUser(prisma, {
      where: { user_id: operator_id },
    }),
  });
}

// # mypage.deleteMypage
async function deleteMypage(reqid: string, prisma: PrismaClient, operator_id: number) {
  log.trace(reqid, 'deleteProfile', operator_id);

  return UserRepository.deleteUser(prisma, { where: { user_id: operator_id } });
}

// mypage.patchPassword
async function patchPassword(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof MypageRouterSchema.patchPasswordInput>,
) {
  log.trace(reqid, 'patchPassword', operator_id, input);

  const user = await MypageService.getMypage(reqid, prisma, operator_id);

  // 現在のパスワードの確認
  if (!HashPassword.compare(input.current_password, user.password)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'パスワードが誤っています。',
    });
  }
  // 新しいパスワードをハッシュ化
  const hashedPassword = HashPassword.hash(input.new_password);

  return UserRepository.updateUser(prisma, {
    data: { password: hashedPassword },
    where: { user_id: user.user_id },
  });
}

// mypage.patchProfile
async function patchProfile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof MypageRouterSchema.patchProfileInput>,
) {
  log.trace(reqid, 'updateProfile', operator_id, input);

  const user = await MypageService.getMypage(reqid, prisma, operator_id);

  await checkDuplicate({
    duplicate: UserRepository.findUniqueUser(prisma, { where: { email: user.email } }),
    current: { key: 'user_id', value: user.user_id },
  });

  return UserRepository.updateUser(prisma, { data: input, where: { user_id: user.user_id } });
}

// # profile.generateSecret
async function generateSecret(reqid: string, prisma: PrismaClient, operator_id: number) {
  log.trace(reqid, 'generateSecret', operator_id);

  const user = await MypageService.getMypage(reqid, prisma, operator_id);

  const secret = OnetimePassword.generateSecret({ name: user.email });

  const dataurl = await OnetimePassword.generateQrcodeUrl({
    secret: secret.ascii,
    name: user.email,
  });

  // セッションに生成したシークレットを保存する
  const setting_twofa = {
    expires: dayjs().add(12, 'hour').toDate(),
    twofa_secret: SecretPassword.encrypt(secret.base32),
  };

  return { dataurl, setting_twofa };
}

// # profile.enableSecret
async function enableSecret(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof MypageRouterSchema.enableSecretInput> & {
    setting_twofa: {
      expires: Date;
      twofa_secret: string;
    } | null;
  },
) {
  log.trace(reqid, 'enableSecret', operator_id, input);

  await MypageService.getMypage(reqid, prisma, operator_id); // checkDataExist

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

  return UserRepository.updateUser(prisma, {
    data: { twofa_enable: true, twofa_secret: input.setting_twofa.twofa_secret },
    where: { user_id: operator_id },
  });
}

// # profile.disableSecret
async function disableSecret(reqid: string, prisma: PrismaClient, operator_id: number) {
  log.trace(reqid, 'disableSecret', operator_id);

  await MypageService.getMypage(reqid, prisma, operator_id); // checkDataExist

  return UserRepository.updateUser(prisma, {
    data: { twofa_enable: false, twofa_secret: '' },
    where: { user_id: operator_id },
  });
}
