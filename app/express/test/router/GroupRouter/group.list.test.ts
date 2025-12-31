import { ExtendsPrismaClient } from '~/middleware/prisma';
import { transactionRollbackTrpc } from '../../helper';
import { createGroup } from './testGroupRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`GroupRouter group.list`, () => {
  test(`✅ success - list groups owned by the login user.
    - it return groups ordered by group_order ascending.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const group1 = await createGroup(tx, operator, { group_order: 0 });
      const group2 = await createGroup(tx, operator, { group_order: 1 });
      const group3 = await createGroup(tx, operator, { group_order: 2 });

      // act
      const output = await caller.group.list();

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
  });

  test(`✅ success - filter by login user.
    - it only return groups owned by the login user.
    - it does not return groups owned by other users.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const other = await tx.user.create({
        data: {
          user_id: '019b7403-f2c4-73ee-92c7-045f7a9b842e',
          username: 'other.user',
          email: 'other.user@example.com',
          password: 'password.other.user@example.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const groupOperator = await createGroup(tx, operator);
      const groupOther = await createGroup(tx, other);

      // act
      const output = await caller.group.list();

      // assert
      expect(output).toHaveLength(1);
      expect(output[0]).toEqual(expect.objectContaining({ group_id: groupOperator.group_id }));
      expect(output).not.toContainEqual(expect.objectContaining({ group_id: groupOther.group_id }));
    });
  });
});
