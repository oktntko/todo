import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';
import { MypageRouterSchema } from '~/schema/MypageRouterSchema';
import { mockopts, transactionRollback, transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.get`, () => {
  test(`✅ success - get user info.
    - it return login user info.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller, operator }) => {
      // arrange
      const input = void 0;

      // act
      const output = await caller.mypage.get(input);

      // assert
      expect(output).toMatchObject(MypageRouterSchema.getOutput.parse(operator));
    });
  });

  test(`⚠️ authentication failure - user is not login.
    - it throw UNAUTHORIZED error.`, async () => {
    return transactionRollback(prisma, async ({ tx }) => {
      // arrange
      const ctx = createContext(mockopts({ user_id: crypto.randomUUID() }), tx);
      const caller = createCaller(ctx);

      const input = void 0;

      // act & assert
      await expect(caller.mypage.get(input)).rejects.toThrow(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: message.error.UNAUTHORIZED,
        }),
      );
    });
  });
});
