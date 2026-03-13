import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema';

import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.get`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - get space by space_id, when operator has $role role.
    - it return the space data.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const input: z.infer<typeof SpaceRouterSchema.getInput> = {
          space_id,
        };

        // act
        const output = await caller.space.get(input);

        // assert
        expect(output).toEqual(expect.objectContaining({ space_id: output.space_id }));
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);

      const input: z.infer<typeof SpaceRouterSchema.getInput> = {
        space_id,
      };

      // act & assert
      await expect(caller.space.get(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof SpaceRouterSchema.getInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
      };

      // act & assert
      await expect(caller.space.get(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
