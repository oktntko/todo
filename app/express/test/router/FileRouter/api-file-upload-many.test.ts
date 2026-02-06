import { z } from '@todo/lib/zod';
import supertest from 'supertest';

import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema';
import { FileService } from '~/service/FileService';

import { transactionRollbackExpress } from '../../helper';
import { createTestSpace } from '../SpaceRouter/_SpaceRouterTestHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/upload/many`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - upload many files, when operator has $role role.
    - it return the created value.
    - it create the record in the database.`,
    async ({ role }) => {
      return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
        // arrange
        const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
        mockWriteFile.mockResolvedValue();

        const space = await createTestSpace(tx, operator, role);

        const input: z.infer<typeof FileRouterSchema.createInputBody> = {
          space_id: space.space_id,
        };

        const output1 = Buffer.from('test1');
        const output2 = Buffer.from('test2');
        const output3 = Buffer.from('test3');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/many`)
          .attach('files', output1, 'test1.txt')
          .attach('files', output2, 'test2.txt')
          .attach('files', output3, 'test3.txt')
          .field('space_id', input.space_id)
          .expect(200);

        // assert
        const expectedValue = [
          {
            file_id: expect.anything(),
            space_id: input.space_id,
            filesize: 5,
            filename: 'test1.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: expect.anything(),
            space_id: input.space_id,
            filesize: 5,
            filename: 'test2.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: expect.anything(),
            space_id: input.space_id,
            filesize: 5,
            filename: 'test3.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
        ] satisfies Awaited<ReturnType<typeof FileService.createManyFile>>;
        expect(res.body).toEqual(expectedValue);

        const created = await tx.file.findMany({
          where: { space_id: input.space_id },
          orderBy: { filename: 'asc' },
        });
        expect(created).toMatchObject(expectedValue);

        // after
        mockWriteFile.mockRestore();
      });
    },
  );

  // TODO テストパターンを追加する

  test(`⚠️ validation error - input incorrect data.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
      mockWriteFile.mockResolvedValueOnce();

      // act
      const res = await supertest(app).post(`/api/file/upload/many`).expect(400);

      // assert
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });

      // after
      mockWriteFile.mockRestore();
    });
  });
});
