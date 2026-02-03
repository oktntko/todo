import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpace } from './_SpaceRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.update`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
  ] as const)(
    `✅ success - update space, when operator has $role role.
    - it return the updated space.
    - it update the record in the database.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof SpaceRouterSchema.updateInput> = {
          space_id: space.space_id,
          space_name: 'updated space name',
          space_description: 'updated description',
          space_image: 'image.jpg',
          space_color: '#FF0000',
          updated_at: space.updated_at,
        };

        // act
        const output = await caller.space.update(input);

        // assert
        expect(output).toEqual({
          ...input,
          created_at: space.created_at,
          updated_at: output.updated_at,
          created_by: space.created_by,
          updated_by: operator.user_id,
        } satisfies typeof output);

        // Verify the record is updated in the database
        const updated = await tx.space.findUniqueOrThrow({
          where: { space_id: space.space_id },
        });
        expect(updated).toMatchObject({
          ...input,
          created_at: space.created_at,
          updated_at: output.updated_at,
          created_by: space.created_by,
          updated_by: operator.user_id,
        } satisfies typeof updated);
      });
    },
  );

  test.for([
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
    - it throw FORBIDDEN error.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof SpaceRouterSchema.updateInput> = {
          space_id: space.space_id,
          space_name: 'updated name',
          space_description: '',
          space_image: '',
          space_color: '#FFFFFF',
          updated_at: space.updated_at,
        };

        // act & assert
        await expect(caller.space.update(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { space_id } = await createTestSpace(tx, operator, 'OWNER');

      const input: z.infer<typeof SpaceRouterSchema.updateInput> = {
        space_id,
        space_name: 'updated name',
        space_description: '',
        space_image: '',
        space_color: '#FFFFFF',
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.space.update(input)).rejects.toThrow(
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

      const input: z.infer<typeof SpaceRouterSchema.updateInput> = {
        space_id: space.space_id,
        space_name: 'updated name',
        space_description: '',
        space_image: '',
        space_color: '#FFFFFF',
        updated_at: space.updated_at,
      };

      // act & assert
      await expect(caller.space.update(input)).rejects.toThrow(
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
      const input: z.infer<typeof SpaceRouterSchema.updateInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        space_name: 'updated name',
        space_description: '',
        space_image: '',
        space_color: '#FFFFFF',
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.space.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
