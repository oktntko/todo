import { z } from '@todo/lib/zod';
import { log } from '~/lib/log4js';
import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { MypageRouterSchema, ProfileSchema } from '~/schema/MypageRouterSchema';
import { MypageService } from '~/service/MypageService';

export const mypage = router({
  // mypage.get
  get: protectedProcedure
    .input(z.void())
    .output(ProfileSchema)
    .query(async ({ ctx }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return MypageService.deleteMypage({ ...ctx, prisma });
      });
    }),

  // mypage.delete
  delete: protectedProcedure.output(z.void()).mutation(async ({ ctx }) => {
    return $transaction(ctx.prisma, async (prisma) => {
      await MypageService.deleteMypage({ ...ctx, prisma });

      ctx.req.session.destroy(() => {
        /*Nothing To Do*/
      });
    });
  }),

  // mypage.patchPassword
  patchPassword: protectedProcedure
    .input(MypageRouterSchema.patchPasswordInput)
    .output(ProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return MypageService.patchPassword({ ...ctx, prisma }, input);
      });
    }),

  // mypage.patchProfile
  patchProfile: protectedProcedure
    .input(MypageRouterSchema.patchProfileInput)
    .output(ProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return MypageService.patchProfile({ ...ctx, prisma }, input);
      });
    }),

  // 二要素認証関連
  // # profile.generateSecret
  generateSecret: protectedProcedure.input(z.void()).mutation(async ({ ctx }) => {
    return $transaction(ctx.prisma, async (prisma) => {
      const data = await MypageService.generateSecret({ ...ctx, prisma });
      log.debug('setting_twofa', data.setting_twofa);

      ctx.req.session.data = {
        ...ctx.req.session.data,
        setting_twofa: data.setting_twofa,
      };

      return { dataurl: data.dataurl };
    });
  }),

  // # profile.enableSecret
  enableSecret: protectedProcedure
    .input(MypageRouterSchema.enableSecretInput)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        const setting_twofa = ctx.req.session.data?.setting_twofa ?? null;
        log.debug('setting_twofa', setting_twofa);

        await MypageService.enableSecret({ ...ctx, prisma }, { ...input, setting_twofa });

        ctx.req.session.data = {
          ...ctx.req.session.data,
          setting_twofa: null,
        };
      });
    }),

  // profile.disableSecret
  disableSecret: protectedProcedure
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        await MypageService.disableSecret({ ...ctx, prisma });

        ctx.req.session.data = ctx.req.session.data ?? {};
        ctx.req.session.data.setting_twofa = null;
      });
    }),

  // profile.patchAichat
  patchAichat: protectedProcedure
    .input(MypageRouterSchema.patchAichatInput)
    .output(ProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return MypageService.patchAichat({ ...ctx, prisma }, input);
      });
    }),
});
