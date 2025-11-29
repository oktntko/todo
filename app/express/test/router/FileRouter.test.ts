import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import supertest from 'supertest';
import { TEST_USER_ID } from 't/helper/express';
import { transactionRollbackUseCaller, transactionRollbackUseMockSession } from 't/helper/prisma';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient, PrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

const prisma = ExtendsPrismaClient;

describe(`FileRouter`, () => {
  describe(`/api/file/download/single`, () => {
    test(`success`, async () => {
      return transactionRollbackUseMockSession(prisma, async ({ tx }) => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        await tx.file.createMany({
          data: [
            {
              file_id: input.file_id,
              filename: `${input.file_id}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
          ],
        });

        const output = Buffer.from('test');
        const mockReadFile = vi.spyOn(FileRepository, 'readFile');
        mockReadFile.mockResolvedValueOnce(output);

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(200);
        expect(res.header).toMatchObject({
          'content-disposition': `attachment; filename=${input.file_id}.txt`,
        });
        expect(res.body).toEqual(output);
      });
    });
    test(`file not found in storage`, async () => {
      return transactionRollbackUseMockSession(prisma, async ({ tx }) => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        await tx.file.createMany({
          data: [
            {
              file_id: input.file_id,
              filename: `${input.file_id}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
          ],
        });

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        });
      });
    });
    test(`file not found in database`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: 'crypto.randomUUID()',
        };

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: message.error.BAD_REQUEST,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'findUniqueFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe(`/api/file/download/many`, () => {
    test(`success`, async () => {
      return transactionRollbackUseMockSession(prisma, async ({ tx }) => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        await tx.file.createMany({
          data: [
            {
              file_id: input.file_id_list[0],
              filename: `${input.file_id_list[0]}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
            {
              file_id: input.file_id_list[1],
              filename: `${input.file_id_list[1]}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
            {
              file_id: input.file_id_list[2],
              filename: `${input.file_id_list[2]}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
          ],
        });

        const output = Buffer.from('test');
        const mockReadFile = vi.spyOn(FileRepository, 'readFile');
        mockReadFile.mockResolvedValue(output);

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(200);
        expect(res.header).toMatchObject({
          'content-disposition': `attachment; filename=download.zip`,
        });
        expect(res.body).toEqual(expect.anything());

        // after
        mockReadFile.mockRestore();
      });
    });
    test(`file not found in storage`, async () => {
      return transactionRollbackUseMockSession(prisma, async ({ tx }) => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        await tx.file.createMany({
          data: [
            {
              file_id: input.file_id_list[0],
              filename: `${input.file_id_list[0]}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
            {
              file_id: input.file_id_list[1],
              filename: `${input.file_id_list[1]}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
            {
              file_id: input.file_id_list[2],
              filename: `${input.file_id_list[2]}.txt`,
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: TEST_USER_ID,
              updated_by: TEST_USER_ID,
            },
          ],
        });

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        });
      });
    });
    test(`file not found in database`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: message.error.NOT_FOUND,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: ['crypto.randomUUID()', crypto.randomUUID(), crypto.randomUUID()],
        };

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: message.error.BAD_REQUEST,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'findUniqueFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe(`/api/file/upload/single`, () => {
    test(`success`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
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
          created_by: TEST_USER_ID,
          updated_by: TEST_USER_ID,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
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
      return transactionRollbackUseMockSession(prisma, async () => {
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

  describe(`/api/file/upload/many`, () => {
    test(`success`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
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
        expect(res.body).toEqual([
          {
            file_id: expect.anything(),
            filesize: 5,
            filename: 'test1.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: TEST_USER_ID,
            updated_by: TEST_USER_ID,
          },
          {
            file_id: expect.anything(),
            filesize: 5,
            filename: 'test2.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: TEST_USER_ID,
            updated_by: TEST_USER_ID,
          },
          {
            file_id: expect.anything(),
            filesize: 5,
            filename: 'test3.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: TEST_USER_ID,
            updated_by: TEST_USER_ID,
          },
        ]);

        // after
        mockWriteFile.mockRestore();
      });
    });
    test(`input error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        // act
        const res = await supertest(app).post(`/api/file/upload/many`);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: message.error.BAD_REQUEST,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollbackUseMockSession(prisma, async () => {
        // arrange
        const mockFindCreateFile = vi.spyOn(FileRepository, 'createFile');
        mockFindCreateFile.mockRejectedValueOnce('test');

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/many`)
          .attach('files', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });

        mockFindCreateFile.mockRestore();
      });
    });
  });

  async function createFile(prisma: PrismaClient) {
    return prisma.file.create({
      data: {
        file_id: 'c30e3b6c-aaa5-438d-902a-2f816111ab40',
        filename: `test.txt`,
        mimetype: 'text/plain',
        filesize: 1024,
        created_at: new Date(2001, 2, 3),
        updated_at: new Date(2001, 2, 3),
        created_by: TEST_USER_ID,
        updated_by: TEST_USER_ID,
      },
    });
  }

  describe(`file.delete`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ tx, caller }) => {
          const file = await createFile(tx);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            ...file,
          };

          //
          const output = await caller.file.delete(input);

          //
          expect(output).toEqual(file);
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ tx, caller }) => {
          const { file_id } = await createFile(tx);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            file_id,
            updated_at: new Date(2001, 2, 4), // updated
          };

          //
          await expect(caller.file.delete(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: message.error.CONFLICT_PREVIOUS_UPDATED,
            }),
          );
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ caller }) => {
          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
            updated_at: new Date(2001, 2, 4),
          };

          //
          await expect(caller.file.delete(input)).rejects.toThrow(
            new TRPCError({
              code: 'NOT_FOUND',
              message: message.error.NOT_FOUND,
            }),
          );
        });
      });
    });
    describe(`test data access`, () => {
      test(`FileRepository.deleteFile single`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ tx, caller }) => {
          const file = await createFile(tx);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            ...file,
          };

          //
          const output = await caller.file.delete(input);

          //
          expect(output).toEqual(file);
          expect(await tx.file.findUnique({ where: { file_id: output.file_id } })).toBeNull();
        });
      });
    });
  });

  describe(`file.deleteMany`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ tx, caller }) => {
          const file = await createFile(tx);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [{ ...file }];

          //
          const output = await caller.file.deleteMany(input);

          //
          expect(output).toEqual([file]);
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ tx, caller }) => {
          const { file_id } = await createFile(tx);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [
            {
              file_id,
              updated_at: new Date(2001, 2, 4), // updated
            },
          ];

          //
          await expect(caller.file.deleteMany(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: message.error.CONFLICT_PREVIOUS_UPDATED,
            }),
          );
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ caller }) => {
          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [
            {
              file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
              updated_at: new Date(2001, 2, 4),
            },
          ];

          //
          await expect(caller.file.deleteMany(input)).rejects.toThrow(
            new TRPCError({
              code: 'NOT_FOUND',
              message: message.error.NOT_FOUND,
            }),
          );
        });
      });
    });
    describe(`test data access`, () => {
      test(`FileRepository.deleteFile many`, async () => {
        return transactionRollbackUseCaller(prisma, async ({ tx, caller }) => {
          const file = await createFile(tx);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [{ ...file }];

          //
          const output = await caller.file.deleteMany(input);

          //
          expect(output).toEqual([file]);
          expect(
            await prisma.file.findUnique({ where: { file_id: output[0]?.file_id } }),
          ).toBeNull();
        });
      });
    });
  });
});
