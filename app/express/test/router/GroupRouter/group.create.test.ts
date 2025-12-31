import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.create`, () => {
  test(`✅ success - create a new group.
    - it return the created group.
    - it create the record in the database.
    - it assign group_order automatically.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const input: z.infer<typeof GroupRouterSchema.createInput> = {
        group_name: 'test group',
        group_description: 'test description',
        group_image: 'iVBORw0KGgoANeSU',
        group_color: '#FFFFFF',
      };

      // act
      const output = await caller.group.create(input);

      // assert
      expect(output).toMatchObject(input);

      // Verify the record is saved in the database
      const created = await tx.group.findUnique({
        where: { group_id: output.group_id },
      });
      expect(created).toMatchObject({
        ...input,
        group_id: output.group_id,
        group_order: 0,
        owner_id: operator.user_id,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        created_by: operator.user_id,
        updated_by: operator.user_id,
      });
    });
  });

  test(`✅ success - group_order is assigned correctly.
    - when creating the first group, group_order should be 0.
    - when creating the second group, group_order should be 1.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input1: z.infer<typeof GroupRouterSchema.createInput> = {
        group_name: 'first group',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
      };

      const input2: z.infer<typeof GroupRouterSchema.createInput> = {
        group_name: 'second group',
        group_description: '',
        group_image: '',
        group_color: '#FFFFFF',
      };

      // act
      const output1 = await caller.group.create(input1);
      const output2 = await caller.group.create(input2);

      // assert
      expect(output1.group_order).toBe(0);
      expect(output2.group_order).toBe(1);
    });
  });
});
