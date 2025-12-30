import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { mockopts, transactionRollback, transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter`, () => {
  describe(`mypage.get`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller, operator }) => {
          // arrange
          const input = void 0;

          // act
          const output = await caller.mypage.get(input);

          // assert
          expect(output).toMatchObject(MypageRouterSchema.getOutput.parse(operator));
        });
      });
      test(`fail. user is not login.`, async () => {
        return transactionRollback(prisma, async ({ tx }) => {
          const ctx = createContext(mockopts({ user_id: crypto.randomUUID() }), tx);
          const caller = createCaller(ctx);
          // arrange
          const input = void 0;

          // act
          await expect(caller.mypage.get(input))
            // assert
            .rejects.toThrow(
              new TRPCError({
                code: 'UNAUTHORIZED',
                message: message.error.UNAUTHORIZED,
              }),
            );
        });
      });
    });
  });
});
