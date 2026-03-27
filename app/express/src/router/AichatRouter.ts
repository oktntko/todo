import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { AichatRouterSchema } from '~/schema/AichatRouterSchema';
import { AichatService } from '~/service/AichatService';

export const aichat = router({
  // aichat.list
  list: protectedProcedure
    .input(AichatRouterSchema.listInput)
    .output(AichatRouterSchema.getOutput.array())
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.listAichat({ ...ctx, prisma }, input);
      });
    }),

  // aichat.get
  get: protectedProcedure
    .input(AichatRouterSchema.getInput)
    .output(AichatRouterSchema.getOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.getAichat({ ...ctx, prisma }, input);
      });
    }),

  // aichat.create
  create: protectedProcedure
    .input(AichatRouterSchema.createInput)
    .output(AichatRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.createAichat({ ...ctx, prisma }, input);
      });
    }),

  // aichat.update
  update: protectedProcedure
    .input(AichatRouterSchema.updateInput)
    .output(AichatRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.updateAichat({ ...ctx, prisma }, input);
      });
    }),

  // aichat.delete
  delete: protectedProcedure
    .input(AichatRouterSchema.deleteInput)
    .output(AichatRouterSchema.getInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.deleteAichat({ ...ctx, prisma }, input);
      });
    }),

  // aichat.listMessage
  listMessage: protectedProcedure
    .input(AichatRouterSchema.listMessageInput)
    .output(AichatRouterSchema.listMessageOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.listAichatMessage({ ...ctx, prisma }, input);
      });
    }),

  // aichat.postMessage
  postMessage: protectedProcedure
    .input(AichatRouterSchema.postMessageInput)
    .output(AichatRouterSchema.listMessageOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(
        ctx.prisma,
        async (prisma) => {
          return AichatService.postAichatMessage({ ...ctx, prisma }, input);
        },
        { maxWait: 5000, timeout: 30000 },
      );
    }),
});
