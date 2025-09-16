import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { AichatRouterSchema, MessagesSchema } from '~/schema/AichatRouterSchema';
import { AichatService } from '~/service/AichatService';

export const aichat = router({
  // aichat.list
  list: protectedProcedure
    .input(AichatRouterSchema.listInput)
    .output(MessagesSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return AichatService.listAichat({ ...ctx, prisma }, input);
      });
    }),

  // aichat.chat
  chat: protectedProcedure
    .input(AichatRouterSchema.chatInput)
    .output(MessagesSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(
        ctx.prisma,
        async (prisma) => {
          return AichatService.chatAichat({ ...ctx, prisma }, input);
        },
        { maxWait: 5000, timeout: 30000 },
      );
    }),
});
