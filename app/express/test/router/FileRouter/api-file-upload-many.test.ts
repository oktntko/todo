import supertest from 'supertest';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/upload/many`, () => {
  test(`✅ success - upload many files.
    - it return the created value.
    - it create the record in the database.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
      mockWriteFile.mockResolvedValue();

      const output1 = Buffer.from('test1');
      const output2 = Buffer.from('test2');
      const output3 = Buffer.from('test3');

      // act
      const res = await supertest(app)
        .post(`/api/file/upload/many`)
        .attach('files', output1, 'test1.txt')
        .attach('files', output2, 'test2.txt')
        .attach('files', output3, 'test3.txt');

      // assert
      expect(res.statusCode).toBe(200);

      const expectedValue = [
        {
          file_id: expect.anything(),
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
          filesize: 5,
          filename: 'test3.txt',
          mimetype: 'text/plain',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          created_by: operator.user_id,
          updated_by: operator.user_id,
        },
      ];
      expect(res.body).toEqual(expectedValue);

      const created = await tx.file.findMany({ orderBy: { filename: 'asc' } });
      expect(created).toMatchObject(expectedValue);

      // after
      mockWriteFile.mockRestore();
    });
  });

  test(`⚠️ validation error - input incorrect data.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
      mockWriteFile.mockResolvedValueOnce();

      // act
      const res = await supertest(app).post(`/api/file/upload/many`);

      // assert
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });

      // after
      mockWriteFile.mockRestore();
    });
  });
});
