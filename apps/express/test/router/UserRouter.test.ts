import { TRPCError } from '@trpc/server';
import { mockopts } from 't/helper/express';
import { transactionRollback } from 't/helper/prisma';
import 't/helper/session';
import { z } from 'zod';
import { generatePrisma, PrismaClient } from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import {
  MESSAGE_DATA_IS_NOT_EXIST,
  MESSAGE_DUPLICATE_IS_EXISTING,
  MESSAGE_PREVIOUS_IS_UPDATED,
} from '~/repository/_repository';
import { createCaller } from '~/router/_router';
import { UserRouterSchema } from '~/schema/UserRouterSchema';
import UserSchema from '~/schema/zod/modelSchema/UserSchema';

const prisma = generatePrisma('test');

describe(`UserRouter`, () => {
  describe(`user.list`, () => {
    describe(`test search input`, () => {
      test(`user_keyword`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                password: '1',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                password: '2',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 3,
                username: '3',
                email: '3@example.com',
                password: '3',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 4,
                username: 'useword',
                email: '4@example.com',
                password: '4',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 5,
                username: '5',
                email: 'useword@example.com',
                password: '5',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 6,
                username: '6',
                email: '6@example.com',
                password: '6',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          });

          const input: z.infer<typeof UserRouterSchema.listInput> = {
            where: {
              user_keyword: 'r_key',
            },
            sort: { field: 'user_id', order: 'asc' },
            limit: 3,
            offset: 0,
          };

          //
          const output = await caller.user.list(input);

          //
          expect(output).toEqual({
            total: 2,
            user_list: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                password: '1',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                password: '2',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          } satisfies z.infer<typeof UserRouterSchema.listOutput>);
        });
      });
      test(`limit & offset`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                password: '1',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                password: '2',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 3,
                username: '3',
                email: '3@example.com',
                password: '3',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 4,
                username: 'useword',
                email: '4@example.com',
                password: '4',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 5,
                username: '5',
                email: 'useword@example.com',
                password: '5',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 6,
                username: '6',
                email: '6@example.com',
                password: '6',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          });

          const input: z.infer<typeof UserRouterSchema.listInput> = {
            where: {
              user_keyword: '',
            },
            sort: { field: 'user_id', order: 'asc' },
            limit: 1,
            offset: 2,
          };

          //
          const output = await caller.user.list(input);

          //
          expect(output).toEqual({
            total: 6,
            user_list: [
              {
                user_id: 3,
                username: '3',
                email: '3@example.com',
                password: '3',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          } satisfies z.infer<typeof UserRouterSchema.listOutput>);
        });
      });
    });
    describe(`test output`, () => {
      test(`full`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'username',
                email: 'email@example.com',
                password: 'password',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          });

          const input: z.infer<typeof UserRouterSchema.listInput> = {
            where: {
              user_keyword: '',
            },
            sort: { field: 'user_id', order: 'asc' },
            limit: 1,
            offset: 0,
          };

          //
          const output = await caller.user.list(input);

          //
          expect(output).toEqual({
            total: 1,
            user_list: [
              {
                user_id: 1,
                username: 'username',
                email: 'email@example.com',
                password: 'password',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          } satisfies z.infer<typeof UserRouterSchema.listOutput>);
        });
      });
      test(`min`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'u',
                email: 'e@example.com',
                password: 'p',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          });

          const input: z.infer<typeof UserRouterSchema.listInput> = {
            where: {
              user_keyword: '',
            },
            sort: { field: 'user_id', order: 'asc' },
            limit: 1,
            offset: 0,
          };

          //
          const output = await caller.user.list(input);

          //
          expect(output).toEqual({
            total: 1,
            user_list: [
              {
                user_id: 1,
                username: 'u',
                email: 'e@example.com',
                password: 'p',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          } satisfies z.infer<typeof UserRouterSchema.listOutput>);
        });
      });
    });
  });

  describe(`user.get`, () => {
    describe(`test decision table`, () => {
      test(`success!`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'username',
              email: 'email@example.com',
              password: 'password',
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
            },
          });

          const input: z.infer<typeof UserRouterSchema.getInput> = {
            user_id: 1,
          };

          //
          const output = await caller.user.get(input);

          //
          expect(output).toEqual({
            user_id: 1,
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const input: z.infer<typeof UserRouterSchema.getInput> = {
            user_id: 1,
          };

          //
          await expect(caller.user.get(input)).rejects.toThrow(
            new TRPCError({
              code: 'NOT_FOUND',
              message: MESSAGE_DATA_IS_NOT_EXIST,
            }),
          );
        });
      });
    });
    describe(`test input schema`, () => {
      test.for([[null]] as const)(`fail. user_id=[%s].`, async ([user_id]) => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          const input: z.infer<typeof UserRouterSchema.getInput> = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            user_id,
          };

          //
          await expect(caller.user.get(input)).rejects.toThrow(
            // TRPCError BAD_REQUEST message
            JSON.stringify(
              [
                {
                  code: 'invalid_type',
                  expected: 'number',
                  received: 'null',
                  path: ['user_id'],
                },
              ],
              null,
              '  ',
            ),
          );
        });
      });
    });
    describe(`test output`, () => {
      test(`full`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'username',
              email: 'email@example.com',
              password: 'password',
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
            },
          });

          const input: z.infer<typeof UserRouterSchema.getInput> = {
            user_id: 1,
          };

          //
          const output = await caller.user.get(input);

          //
          expect(output).toEqual({
            user_id: 1,
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
      test(`min`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'u',
              email: 'e@example.com',
              password: 'p',
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
            },
          });

          const input: z.infer<typeof UserRouterSchema.getInput> = {
            user_id: 1,
          };

          //
          const output = await caller.user.get(input);

          //
          expect(output).toEqual({
            user_id: 1,
            username: 'u',
            email: 'e@example.com',
            password: 'p',
            twofa_enable: false,
            twofa_secret: '',
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
    });
  });

  describe(`user.create`, () => {
    describe(`test decision table`, () => {
      test(`success!`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
      test(`fail. duplicate is existing.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'username',
              email: 'email@example.com',
              password: 'password',
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
            },
          });

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'createInput username',
            email: 'email@example.com',
            password: 'createInput password',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          await expect(caller.user.create(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: MESSAGE_DUPLICATE_IS_EXISTING,
            }),
          );
        });
      });
    });
    describe(`test input schema`, () => {
      test.for([
        [
          '',
          'email@example.com',
          'password',
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              path: ['username'],
            },
          ],
        ],
        [
          'username',
          '',
          'password',
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              path: ['email'],
            },
            {
              validation: 'email',
              code: 'invalid_string',
              path: ['email'],
            },
          ],
        ],
        [
          'username',
          'email@example.com',
          '',
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              path: ['password'],
            },
          ],
        ],
      ] as const)(
        `fail. username=[%s] email=[%s] password=[%s].`,
        async ([username, email, password, message]) => {
          return transactionRollback(prisma, async (prisma) => {
            const ctx = createContext(mockopts(), prisma);
            const caller = createCaller(ctx);
            //
            const input: z.infer<typeof UserRouterSchema.createInput> = {
              username,
              email,
              password,
              twofa_enable: false,
              twofa_secret: '',
            };

            //
            await expect(caller.user.create(input)).rejects.toThrow(
              // TRPCError BAD_REQUEST message
              JSON.stringify(message, null, '  '),
            );
          });
        },
      );
    });
    describe(`test output`, () => {
      test(`full`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
      test(`min`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'u',
            email: 'e@example.com',
            password: 'p',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'u',
            email: 'e@example.com',
            password: 'p',
            twofa_enable: false,
            twofa_secret: '',
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
    });
    describe(`test data access`, () => {
      test(`UserRepository.createUser`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'username',
            email: 'email@example.com',
            password: 'password',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            ...input,
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
          expect(output).toEqual(
            await prisma.user.findUnique({ where: { user_id: output.user_id } }),
          );
        });
      });
    });
  });

  async function createUser(prisma: PrismaClient) {
    return prisma.user.create({
      data: {
        user_id: 1,
        username: 'username',
        email: 'email@example.com',
        password: 'password',
        created_at: new Date(2001, 2, 3),
        updated_at: new Date(2001, 2, 3),
      },
    });
  }

  describe(`user.update`, () => {
    describe(`test decision table`, () => {
      test(`success!`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
      test(`fail. duplicate is existing.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          await prisma.user.create({
            data: {
              user_id: 2,
              username: 'duplicate',
              email: 'duplicate@example.com', // duplicate
              password: 'password',
              twofa_enable: false,
              twofa_secret: '',
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
            },
          });

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'duplicate@example.com', // duplicate
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          await expect(caller.user.update(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: MESSAGE_DUPLICATE_IS_EXISTING,
            }),
          );
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const { user_id } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at: new Date(2001, 2, 4), // updated
            username: 'USERNAME',
            email: 'duplicate@example.com',
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          await expect(caller.user.update(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: MESSAGE_PREVIOUS_IS_UPDATED,
            }),
          );
        });
      });
    });
    describe(`test input schema`, () => {
      test.for([
        [
          '',
          'email@example.com',
          'password',
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              path: ['username'],
            },
          ],
        ],
        [
          'username',
          '',
          'password',
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              path: ['email'],
            },
            {
              validation: 'email',
              code: 'invalid_string',
              path: ['email'],
            },
          ],
        ],
        [
          'username',
          'email@example.com',
          '',
          [
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              exact: false,
              path: ['password'],
            },
          ],
        ],
      ] as const)(
        `fail. username=[%s] email=[%s] password=[%s].`,
        async ([username, email, password, message]) => {
          return transactionRollback(prisma, async (prisma) => {
            const ctx = createContext(mockopts(), prisma);
            const caller = createCaller(ctx);
            //
            await prisma.user.deleteMany();

            const { user_id, updated_at } = await createUser(prisma);

            const input: z.infer<typeof UserRouterSchema.updateInput> = {
              user_id,
              updated_at,
              username,
              email,
              password,
              twofa_enable: false,
              twofa_secret: '',
            };

            //
            await expect(caller.user.update(input)).rejects.toThrow(
              // TRPCError BAD_REQUEST message
              JSON.stringify(message, null, '  '),
            );
          });
        },
      );
    });
    describe(`test output`, () => {
      test(`full`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
      test(`min`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'U',
            email: 'E@EXAMPLE.COM',
            password: 'P',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'U',
            email: 'E@EXAMPLE.COM',
            password: 'P',
            twofa_enable: false,
            twofa_secret: '',
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
        });
      });
    });
    describe(`test data access`, () => {
      test(`UserRepository.updateUser`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            password: 'PASSWORD',
            twofa_enable: false,
            twofa_secret: '',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            ...input,
            created_at: expect.anything(),
            updated_at: expect.anything(),
          } satisfies z.infer<typeof UserSchema>);
          expect(output).toEqual(
            await prisma.user.findUnique({ where: { user_id: output.user_id } }),
          );
        });
      });
    });
  });

  describe(`user.delete`, () => {
    describe(`test decision table`, () => {
      test(`success!`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const user = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.deleteInput> = {
            ...user,
          };

          //
          const output = await caller.user.delete(input);

          //
          expect(output).toEqual(user);
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.deleteMany();

          const { user_id } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.deleteInput> = {
            user_id,
            updated_at: new Date(2001, 2, 4), // updated
          };

          //
          await expect(caller.user.delete(input)).rejects.toThrow(
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

          const input: z.infer<typeof UserRouterSchema.deleteInput> = {
            user_id: 9999, // not found
            updated_at: new Date(2001, 2, 4),
          };

          //
          await expect(caller.user.delete(input)).rejects.toThrow(
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
          await prisma.user.deleteMany();

          const user = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.deleteInput> = {
            ...user,
          };

          //
          const output = await caller.user.delete(input);

          //
          expect(output).toEqual(user);
          expect(await prisma.user.findUnique({ where: { user_id: output.user_id } })).toBeNull();
        });
      });
    });
  });
});
