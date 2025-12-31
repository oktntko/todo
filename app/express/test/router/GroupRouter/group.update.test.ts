import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from './testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.update`, () => {
  test(`✅ success - update group.
    - it return the updated group.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator);

      const input: z.infer<typeof GroupRouterSchema.updateInput> = {
        group_id: group.group_id,
        group_name: 'updated group name',
        group_description: 'updated description',
        group_image: 'image.jpg',
        group_color: '#FF0000',
        updated_at: group.updated_at,
      };

      // act
      const output = await caller.group.update(input);

      // assert
      expect(output).toEqual(
        expect.objectContaining({
          group_id: group.group_id,
          group_name: input.group_name,
          group_description: input.group_description,
          group_image: input.group_image,
          group_color: input.group_color,
        }),
      );

      // Verify the record is updated in the database
      const updated = await tx.group.findUnique({
        where: { group_id: group.group_id },
      });
      expect(updated).not.toBeNull();
      expect(updated).toEqual(
        expect.objectContaining({
          group_name: input.group_name,
          group_description: input.group_description,
        }),
      );
    });
  });

  test(`⚠️ resource state error - concurrency update.
    - it throw CONFLICT error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const { group_id } = await createGroup(tx, operator);

      const input: z.infer<typeof GroupRouterSchema.updateInput> = {
        group_id,
        group_name: 'updated name',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
        updated_at: new Date(2001, 2, 4), // outdated
      };

      // act & assert
      await expect(caller.group.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: message.error.CONFLICT_PREVIOUS_UPDATED,
        }),
      );
    });
  });

  test(`⚠️ resource state error - data not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof GroupRouterSchema.updateInput> = {
        group_id: 999999, // not found
        group_name: 'updated name',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
        updated_at: new Date(2001, 2, 4),
      };

      // act & assert
      await expect(caller.group.update(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
