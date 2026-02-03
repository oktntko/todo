import { ExtendsPrismaClient } from '~/middleware/prisma';

import { createTestUser, transactionRollbackTrpc } from '../../helper';
import { createTestSpace } from './_SpaceRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.list`, () => {
  test(`✅ success - list spaces owned by the login user.
    - it return spaces ordered by updated_at ascending.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const spaceOWNER = await createTestSpace(tx, operator, 'OWNER');
      const spaceADMIN = await createTestSpace(tx, operator, 'ADMIN');
      const spaceEDITOR = await createTestSpace(tx, operator, 'EDITOR');
      const spaceREADER = await createTestSpace(tx, operator, 'READER');
      await createTestSpace(tx, operator, undefined);

      // act
      const output = await caller.space.list();

      // assert
      expect(output).toHaveLength(4);
      expect(output).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ space_id: spaceOWNER.space_id }),
          expect.objectContaining({ space_id: spaceADMIN.space_id }),
          expect.objectContaining({ space_id: spaceEDITOR.space_id }),
          expect.objectContaining({ space_id: spaceREADER.space_id }),
        ]),
      );
      // Verify order
      expect(output[0]!.updated_at.getTime()).toBeLessThan(output[1]!.updated_at.getTime());
      expect(output[1]!.updated_at.getTime()).toBeLessThan(output[2]!.updated_at.getTime());
      expect(output[2]!.updated_at.getTime()).toBeLessThan(output[3]!.updated_at.getTime());
    });
  });

  test(`✅ success - filter by login user.
    - it only return spaces owned by the login user.
    - it does not return spaces owned by other users.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const other = await createTestUser(tx);

      const spaceOperator = await createTestSpace(tx, operator, 'OWNER');
      const spaceOther = await createTestSpace(tx, other, 'OWNER');

      // act
      const output = await caller.space.list();

      // assert
      expect(output).toHaveLength(1);
      expect(output[0]).toEqual(expect.objectContaining({ space_id: spaceOperator.space_id }));
      expect(output).not.toContainEqual(expect.objectContaining({ space_id: spaceOther.space_id }));
    });
  });
});
