import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';

import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

import { transactionRollbackTrpc } from '../../helper';
import { createTestSpace } from '../SpaceRouter/_SpaceRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`WhiteboardRouter whiteboard.create`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' },
  ] as const)(
    `✅ success - create a new whiteboard, when operator has $role role.
    - it return the created whiteboard.
    - it save the record in the database.
    - it assign whiteboard_order automatically.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof WhiteboardRouterSchema.createInput> = {
          space_id: space.space_id,
          whiteboard_name: 'test whiteboard',
          whiteboard_description: 'test description',
          whiteboard_content: '{}',
        };

        // act
        const output = await caller.whiteboard.create(input);

        // assert
        expect(output).toEqual({
          ...input,
          whiteboard_id: output.whiteboard_id,
          whiteboard_order: 0,
          created_at: output.created_at,
          updated_at: output.updated_at,
          created_by: operator.user_id,
          updated_by: operator.user_id,
        } satisfies typeof output);

        // Verify the record is saved in the database
        const created = await tx.whiteboard.findUniqueOrThrow({
          where: { whiteboard_id: output.whiteboard_id },
        });

        expect(created).toMatchObject({
          ...input,
          whiteboard_id: output.whiteboard_id,
          whiteboard_order: 0,
          created_at: output.created_at,
          updated_at: output.updated_at,
          created_by: operator.user_id,
          updated_by: operator.user_id,
        });
      });
    },
  );

  test(`✅ success - whiteboard_order is assigned correctly.
    - when creating the first whiteboard, whiteboard_order should be 0.
    - when creating the second whiteboard, whiteboard_order should be 1.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await createTestSpace(tx, operator, 'OWNER');

      const input1: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        space_id: space.space_id,
        whiteboard_name: 'first whiteboard',
        whiteboard_description: '',
        whiteboard_content: '{}',
      };

      const input2: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        space_id: space.space_id,
        whiteboard_name: 'second whiteboard',
        whiteboard_description: '',
        whiteboard_content: '{}',
      };

      // act
      const output1 = await caller.whiteboard.create(input1);
      const output2 = await caller.whiteboard.create(input2);

      // assert
      expect(output1.whiteboard_order).toBe(0);
      expect(output2.whiteboard_order).toBe(1);
    });
  });

  test.for([
    { role: 'READER' }, //
  ] as const)(
    `⚠️ unauthorized error - operator does not have changeable authorization to the data, when operator has $role role.
      - it throw FORBIDDEN error.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof WhiteboardRouterSchema.createInput> = {
          space_id: space.space_id,
          whiteboard_name: 'test whiteboard',
          whiteboard_description: 'test description',
          whiteboard_content: '{}',
        };

        // act & assert
        await expect(caller.whiteboard.create(input)).rejects.toThrow(
          new TRPCError({
            code: 'FORBIDDEN',
            message: message.error.FORBIDDEN,
          }),
        );
      });
    },
  );

  test(`⚠️ unauthorized error - operator has no authorization to the data.
        - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await createTestSpace(tx, operator, undefined);

      const input: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        space_id: space.space_id,
        whiteboard_name: 'test whiteboard',
        whiteboard_description: 'test description',
        whiteboard_content: '{}',
      };

      // act & assert
      await expect(caller.whiteboard.create(input)).rejects.toThrow(
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
      const input: z.infer<typeof WhiteboardRouterSchema.createInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
        whiteboard_name: 'test whiteboard',
        whiteboard_description: 'test description',
        whiteboard_content: '{}',
      };

      // act & assert
      await expect(caller.whiteboard.create(input)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        }),
      );
    });
  });
});
