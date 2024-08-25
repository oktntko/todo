import { TRPCError } from '@trpc/server';
import supertest from 'supertest';
import { mockCreateContext, mockopts } from 't/helper/express.js';
import { transactionRollback } from 't/helper/prisma.js';
import 't/helper/session.js';
import { app } from '~/app.js';
import { z } from '~/lib/zod.js';
import { generatePrisma, PrismaClient } from '~/middleware/prisma.js';
import { createContext } from '~/middleware/trpc.js';
import {
  MESSAGE_DATA_IS_NOT_EXIST,
  MESSAGE_INPUT_INVALID,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_PREVIOUS_IS_UPDATED,
} from '~/repository/_repository.js';
import { FileRepository } from '~/repository/FileRepository.js';
import { createCaller } from '~/router/_router.js';
import { FileRouterSchema } from '~/schema/FileRouterSchema.js';

const prisma = generatePrisma('test');

describe(`FileRouter`, () => {
  describe(`/api/file/download/single`, () => {
    test(`success`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        await prisma.file.createMany({
          data: [
            {
              file_id: input.file_id,
              filename: `${input.file_id}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
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
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        await prisma.file.createMany({
          data: [
            {
              file_id: input.file_id,
              filename: `${input.file_id}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
            },
          ],
        });

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: MESSAGE_DATA_IS_NOT_EXIST,
        });
      });
    });
    test(`file not found in database`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: MESSAGE_DATA_IS_NOT_EXIST,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: 'crypto.randomUUID()',
        };

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: MESSAGE_INPUT_INVALID,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

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
          message: MESSAGE_INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe(`/api/file/download/many`, () => {
    test(`success`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        await prisma.file.createMany({
          data: [
            {
              file_id: input.file_id[0],
              filename: `${input.file_id[0]}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
            },
            {
              file_id: input.file_id[1],
              filename: `${input.file_id[1]}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
            },
            {
              file_id: input.file_id[2],
              filename: `${input.file_id[2]}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
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

        mockReadFile.mockRestore();
      });
    });
    test(`file not found in storage`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        await prisma.file.createMany({
          data: [
            {
              file_id: input.file_id[0],
              filename: `${input.file_id[0]}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
            },
            {
              file_id: input.file_id[1],
              filename: `${input.file_id[1]}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
            },
            {
              file_id: input.file_id[2],
              filename: `${input.file_id[2]}.txt`,
              mimetype: 'text/plain',
              size: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: 0,
              updated_by: 0,
            },
          ],
        });

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: MESSAGE_DATA_IS_NOT_EXIST,
        });
      });
    });
    test(`file not found in database`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          code: 'NOT_FOUND',
          message: MESSAGE_DATA_IS_NOT_EXIST,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id: ['crypto.randomUUID()', crypto.randomUUID(), crypto.randomUUID()],
        };

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: MESSAGE_INPUT_INVALID,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'findUniqueFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: MESSAGE_INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe(`/api/file/upload/single`, () => {
    test(`success`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          file_id: expect.anything(),
          size: 4,
          filename: 'test.txt',
          mimetype: 'text/plain',
          created_by: 1,
          created_at: expect.anything(),
          updated_by: 1,
          updated_at: expect.anything(),
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        // act
        const res = await supertest(app).post(`/api/file/upload/single`);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: MESSAGE_INPUT_INVALID,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'createFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: MESSAGE_INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe(`/api/file/upload/many`, () => {
    test(`success`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValue();

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
            size: 5,
            filename: 'test1.txt',
            mimetype: 'text/plain',
            created_by: 1,
            created_at: expect.anything(),
            updated_by: 1,
            updated_at: expect.anything(),
          },
          {
            file_id: expect.anything(),
            size: 5,
            filename: 'test2.txt',
            mimetype: 'text/plain',
            created_by: 1,
            created_at: expect.anything(),
            updated_by: 1,
            updated_at: expect.anything(),
          },
          {
            file_id: expect.anything(),
            size: 5,
            filename: 'test3.txt',
            mimetype: 'text/plain',
            created_by: 1,
            created_at: expect.anything(),
            updated_by: 1,
            updated_at: expect.anything(),
          },
        ]);

        mockReadFile.mockRestore();
      });
    });
    test(`input error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        // act
        const res = await supertest(app).post(`/api/file/upload/many`);

        // assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          code: 'BAD_REQUEST',
          message: MESSAGE_INPUT_INVALID,
        });
      });
    });
    test(`system error`, async () => {
      return transactionRollback(prisma, async (prisma) => {
        // arrange
        mockCreateContext(prisma);

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'createFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/many`)
          .attach('files', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: MESSAGE_INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  async function createFile(prisma: PrismaClient) {
    return prisma.file.create({
      data: {
        file_id: 'c30e3b6c-aaa5-438d-902a-2f816111ab40',
        filename: `test.txt`,
        mimetype: 'text/plain',
        size: 1024,
        created_at: new Date(2001, 2, 3),
        updated_at: new Date(2001, 2, 3),
        created_by: 0,
        updated_by: 0,
      },
    });
  }

  describe(`file.delete`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const file = await createFile(prisma);

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
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const { file_id } = await createFile(prisma);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            file_id,
            updated_at: new Date(2001, 2, 4), // updated
          };

          //
          await expect(caller.file.delete(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: MESSAGE_PREVIOUS_IS_UPDATED,
            }),
          );
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
            updated_at: new Date(2001, 2, 4),
          };

          //
          await expect(caller.file.delete(input)).rejects.toThrow(
            new TRPCError({
              code: 'NOT_FOUND',
              message: MESSAGE_DATA_IS_NOT_EXIST,
            }),
          );
        });
      });
    });
    describe(`test data access`, () => {
      test(`UserRepository.deleteUser`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const file = await createFile(prisma);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            ...file,
          };

          //
          const output = await caller.file.delete(input);

          //
          expect(output).toEqual(file);
          expect(await prisma.file.findUnique({ where: { file_id: output.file_id } })).toBeNull();
        });
      });
    });
  });

  describe(`file.deleteMany`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const file = await createFile(prisma);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [{ ...file }];

          //
          const output = await caller.file.deleteMany(input);

          //
          expect(output).toEqual([file]);
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const { file_id } = await createFile(prisma);

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
              message: MESSAGE_PREVIOUS_IS_UPDATED,
            }),
          );
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //

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
              message: MESSAGE_DATA_IS_NOT_EXIST,
            }),
          );
        });
      });
    });
    describe(`test data access`, () => {
      test(`UserRepository.deleteUser`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const file = await createFile(prisma);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [{ ...file }];

          //
          const output = await caller.file.deleteMany(input);

          //
          expect(output).toEqual([file]);
          expect(
            await prisma.file.findUnique({ where: { file_id: output[0].file_id } }),
          ).toBeNull();
        });
      });
    });
  });
});
