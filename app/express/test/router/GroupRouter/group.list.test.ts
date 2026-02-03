import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { GroupRouterSchema } from '~/schema';

import { createTestUser, transactionRollbackTrpc } from '../../helper';
import { addTestGroup, createTestSpaceAndAddGroup } from './_GroupRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.list`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - list groups owned by the login user, when operator has $role role.
    - it return groups ordered by group_order ascending.`,
    async ({ role }) => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const group1 = await createTestSpaceAndAddGroup(tx, operator, role, { group_order: 2 });
        const group2 = await addTestGroup(tx, operator, group1, { group_order: 0 });
        const group3 = await addTestGroup(tx, operator, group1, { group_order: 1 });

        await createTestSpaceAndAddGroup(tx, operator, role); // 権限はあるが異なる space_id
        await createTestSpaceAndAddGroup(tx, operator, undefined); // 権限がない space_id

        const input: z.infer<typeof GroupRouterSchema.listInput> = {
          space_id: group1.space_id,
        };

        // act
        const output = await caller.group.list(input);

        // assert
        expect(output).toHaveLength(3);
        expect(output).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ group_id: group1.group_id }),
            expect.objectContaining({ group_id: group2.group_id }),
            expect.objectContaining({ group_id: group3.group_id }),
          ]),
        );
        // Verify order
        expect(output[0]!.group_order).toBeLessThan(output[1]!.group_order);
        expect(output[1]!.group_order).toBeLessThan(output[2]!.group_order);
      });
    },
  );

  test(`✅ success - filter by login user.
    - it does not return groups owned by other users.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller }) => {
      // arrange
      const other = await createTestUser(tx);

      const groupOther = await createTestSpaceAndAddGroup(tx, other, 'OWNER');

      const input: z.infer<typeof GroupRouterSchema.listInput> = {
        space_id: groupOther.space_id,
      };

      // act
      const output = await caller.group.list(input);

      // assert
      expect(output).toHaveLength(0);
    });
  });

  test(`✅ success - data not found in database.
    - it does not return groups.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ caller }) => {
      // arrange
      const input: z.infer<typeof GroupRouterSchema.listInput> = {
        space_id: '019c23d1-31db-70ed-bfda-84f64ea77614', // not found
      };

      // act
      const output = await caller.group.list(input);

      // assert
      expect(output).toHaveLength(0);
    });
  });
});
