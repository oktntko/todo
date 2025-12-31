import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from './testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.reorder`, () => {
  test(`✅ success - reorder groups.
    - it return { ok: true }.
    - it update the group_order in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createGroup(tx, operator, { group_order: 0 });
      const group2 = await createGroup(tx, operator, { group_order: 1 });
      const group3 = await createGroup(tx, operator, { group_order: 2 });

      const input: z.infer<typeof GroupRouterSchema.reorderInputList> = [
        {
          group_id: group3.group_id,
          group_order: 0,
        },
        {
          group_id: group2.group_id,
          group_order: 1,
        },
        {
          group_id: group1.group_id,
          group_order: 2,
        },
      ];

      // act
      const output = await caller.group.reorder(input);

      // assert
      expect(output).toEqual({ ok: true });

      // Verify the records are updated in the database
      const updated1 = await tx.group.findUnique({
        where: { group_id: group1.group_id },
      });
      const updated2 = await tx.group.findUnique({
        where: { group_id: group2.group_id },
      });
      const updated3 = await tx.group.findUnique({
        where: { group_id: group3.group_id },
      });

      expect(updated1?.group_order).toBe(2);
      expect(updated2?.group_order).toBe(1);
      expect(updated3?.group_order).toBe(0);
    });
  });

  test(`✅ success - reorder single group.
    - it return { ok: true }.
    - it update the group_order.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group = await createGroup(tx, operator, { group_order: 0 });

      const input: z.infer<typeof GroupRouterSchema.reorderInputList> = [
        {
          group_id: group.group_id,
          group_order: 5,
        },
      ];

      // act
      const output = await caller.group.reorder(input);

      // assert
      expect(output).toEqual({ ok: true });

      // Verify the record is updated in the database
      const updated = await tx.group.findUnique({
        where: { group_id: group.group_id },
      });
      expect(updated?.group_order).toBe(5);
    });
  });
});
