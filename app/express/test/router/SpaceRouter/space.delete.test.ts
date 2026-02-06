import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpace } from './_SpaceRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.delete`, () => {
  test.for([
    { role: 'OWNER' }, //
  ] as const)(
    `✅ success - delete space, when operator has $role role.
    - it return the deleted space.
    - it delete the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof SpaceRouterSchema.deleteInput> = {
          space_id: space.space_id,
          updated_at: space.updated_at,
        };

        // act
        const output = await caller.space.delete(input);

        // assert
        expect(output).toEqual({
          space_id: input.space_id,
        });

        // Verify the record is deleted in the database
        const deleted = await tx.space.findUnique({
          where: { space_id: space.space_id },
        });
        expect(deleted).toBeNull();
      });
    },
  );

  test.for([
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
    - it throw FORBIDDEN error.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof SpaceRouterSchema.deleteInput> = {
          space_id: space.space_id,
          updated_at: space.updated_at,
        };

        // act & assert
        await expect(caller.space.delete(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ resource state error - concurrency delete.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await createTestSpace(tx, operator, 'OWNER');

      const input: z.infer<typeof SpaceRouterSchema.deleteInput> = {
        space_id,
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.space.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_CURRENT_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await createTestSpace(tx, operator, undefined);

      const input: z.infer<typeof SpaceRouterSchema.deleteInput> = {
        space_id: space.space_id,
        updated_at: space.updated_at,
      };

      // act & assert
      await expect(caller.space.delete(input)).rejects.toThrow(
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
      const input: z.infer<typeof SpaceRouterSchema.deleteInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.space.delete(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
