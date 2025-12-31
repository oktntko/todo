import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';
import { mockopts, transactionRollback, transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`MypageRouter mypage.delete`, () => {
  test(`✅ success - delete user.
    - it delete the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller, operator, tx }) => {
      // arrange
      const input = void 0;

      // act
      await caller.mypage.delete(input);

      // assert
      const deleted = await tx.user.findUnique({
        where: { user_id: operator.user_id },
      });
      expect(deleted).toBeNull();
    });
  });

  test(`⚠️ authentication failure - user is not login.
    - it throw UNAUTHORIZED error.`, async () => {
    return transactionRollback(prisma, async ({ tx }) => {
      const ctx = createContext(mockopts({ user_id: crypto.randomUUID() }), tx);
      const caller = createCaller(ctx);
      // arrange
      const input = void 0;

      // act & assert
      await expect(caller.mypage.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: message.error.UNAUTHORIZED,
        }),
      );
    });
  });
});
