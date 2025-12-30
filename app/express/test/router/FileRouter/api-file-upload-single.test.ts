import supertest from 'supertest';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter`, () => {
  describe(`/api/file/upload/single`, () => {
    test(`success`, async () => {
      return transactionRollbackExpress(prisma, async ({ operator }) => {
        // arrange
        const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
        mockWriteFile.mockResolvedValueOnce();

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          file_id: expect.anything(),
          filesize: 4,
          filename: 'test.txt',
          mimetype: 'text/plain',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          created_by: operator.user_id,
          updated_by: operator.user_id,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollbackExpress(prisma, async () => {
        // arrange
        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        // act
        const res = await supertest(app).post(`/api/file/upload/single`);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: message.error.BAD_REQUEST,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollbackExpress(prisma, async () => {
        // arrange
        const mockFindCreateFile = vi.spyOn(FileRepository, 'createFile');
        mockFindCreateFile.mockRejectedValueOnce('test');

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });

        // after
        mockFindCreateFile.mockRestore();
      });
    });
  });
});
