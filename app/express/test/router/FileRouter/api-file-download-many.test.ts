import { z } from '@todo/lib/zod';
import supertest from 'supertest';

import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { FileFactory } from '../../factory/FileFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/download/many`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - download many files as zip file, when operator has $role role.
    - it return zip file.`,
    async ({ role }) => {
      return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const file1 = await FileFactory.create(tx, { space_id });
        const file2 = await FileFactory.create(tx, { space_id });
        const file3 = await FileFactory.create(tx, { space_id });

        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: [file1.file_id, file2.file_id, file3.file_id],
        };

        const output = Buffer.from('test');
        const mockReadFile = vi.spyOn(FileRepository, 'readFile');
        mockReadFile.mockResolvedValue(output);

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input).expect(200);

        // assert
        expect(res.header).toMatchObject({
          'content-disposition': `attachment; filename=download.zip`,
        });
        expect(res.body).toEqual(expect.anything());

        // after
        mockReadFile.mockRestore();
      });
    },
  );

  test(`⚠️ resource state error - file not found in storage.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const spaceA = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const spaceB = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const spaceC = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const file1 = await FileFactory.create(tx, { space_id: spaceA.space_id });
      const file2 = await FileFactory.create(tx, { space_id: spaceB.space_id });
      const file3 = await FileFactory.create(tx, { space_id: spaceC.space_id });

      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: [file1.file_id, file2.file_id, file3.file_id],
      };

      // act
      const res = await supertest(app).get(`/api/file/download/many`).query(input).expect(404);

      // assert
      expect(res.body).toEqual({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    });
  });

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const unauthorizedSpace = await SpaceFactory.create(tx);
      const unauthorizedFile = await FileFactory.create(tx, {
        space_id: unauthorizedSpace.space_id,
      });

      const authorizedSpace = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });
      const authorizedFile = await FileFactory.create(tx, {
        space_id: authorizedSpace.space_id,
      });

      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: [unauthorizedFile.file_id, authorizedFile.file_id],
      };

      // act & assert
      const res = await supertest(app).get(`/api/file/download/many`).query(input).expect(404);

      expect(res.body).toEqual({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    });
  });

  test(`⚠️ resource state error - file not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
      };

      // act
      const res = await supertest(app).get(`/api/file/download/many`).query(input).expect(404);

      // assert
      expect(res.body).toEqual({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    });
  });

  test(`⚠️ validation error - input incorrect data.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: ['crypto.randomUUID()', crypto.randomUUID(), crypto.randomUUID()],
      };

      // act
      const res = await supertest(app).get(`/api/file/download/many`).query(input).expect(400);

      // assert
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });
    });
  });
});
