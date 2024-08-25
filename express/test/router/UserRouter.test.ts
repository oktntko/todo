import { TRPCError } from '@trpc/server';
import { mockopts } from 't/helper/express.js';
import { transactionRollback } from 't/helper/prisma.js';
import 't/helper/session.js';
import { z } from 'zod';
import { generatePrisma, PrismaClient } from '~/middleware/prisma.js';
import { createContext } from '~/middleware/trpc.js';
import {
  MESSAGE_DATA_IS_NOT_EXIST,
  MESSAGE_DUPLICATE_IS_EXISTING,
  MESSAGE_PREVIOUS_IS_UPDATED,
} from '~/repository/_repository.js';
import { createCaller } from '~/router/_router.js';
import { UserRouterSchema } from '~/schema/UserRouterSchema.js';
import UserSchema from '~/schema/zod/modelSchema/UserSchema.js';

const prisma = generatePrisma('test');

describe(`UserRouter`, () => {
  describe(`user.list`, () => {
    describe(`test search input`, () => {
      test(`user_keyword`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);
          //
          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                description: '',
                password: '1',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                description: '',
                password: '2',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 3,
                username: '3',
                email: '3@example.com',
                description: 'user_keyword',
                password: '3',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 4,
                username: 'useword',
                email: '4@example.com',
                description: '',
                password: '4',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 5,
                username: '5',
                email: 'useword@example.com',
                description: '',
                password: '5',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 6,
                username: '6',
                email: '6@example.com',
                description: 'useword',
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
            total: 3,
            user_list: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                description: '',
                password: '1',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                description: '',
                password: '2',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 3,
                username: '3',
                email: '3@example.com',
                description: 'user_keyword',
                password: '3',
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
          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                description: '',
                password: '1',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                description: '',
                password: '2',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 3,
                username: '3',
                email: '3@example.com',
                description: 'user_keyword',
                password: '3',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 4,
                username: 'useword',
                email: '4@example.com',
                description: '',
                password: '4',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 5,
                username: '5',
                email: 'useword@example.com',
                description: '',
                password: '5',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 6,
                username: '6',
                email: '6@example.com',
                description: 'useword',
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
                description: 'user_keyword',
                password: '3',
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
          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'username',
                email: 'email@example.com',
                description: 'description',
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
                description: 'description',
                password: 'password',
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
          await prisma.user.createMany({
            data: [
              {
                user_id: 1,
                username: 'u',
                email: 'e@example.com',
                description: '',
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
                description: '',
                password: 'p',
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
          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'username',
              email: 'email@example.com',
              description: 'description',
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
            description: 'description',
            password: 'password',
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
            //
            new TRPCError({
              code: 'BAD_REQUEST',
              message: JSON.stringify(
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
            }),
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
          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'username',
              email: 'email@example.com',
              description: 'description',
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
            description: 'description',
            password: 'password',
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
          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'u',
              email: 'e@example.com',
              description: '',
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
            description: '',
            password: 'p',
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

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'username',
            email: 'email@example.com',
            description: 'description',
            password: 'password',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'username',
            email: 'email@example.com',
            description: 'description',
            password: 'password',
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
          await prisma.user.create({
            data: {
              user_id: 1,
              username: 'username',
              email: 'email@example.com',
              description: 'description',
              password: 'password',
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
            },
          });

          const input: z.infer<typeof UserRouterSchema.createInput> = {
            username: 'createInput username',
            email: 'email@example.com',
            description: 'createInput description',
            password: 'createInput password',
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
              description: '',
              password,
            };

            //
            await expect(caller.user.create(input)).rejects.toThrow(
              //
              new TRPCError({
                code: 'BAD_REQUEST',
                message: JSON.stringify(message, null, '  '),
              }),
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
            description: 'description',
            password: 'password',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'username',
            email: 'email@example.com',
            description: 'description',
            password: 'password',
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
            description: '',
            password: 'p',
          };

          //
          const output = await caller.user.create(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'u',
            email: 'e@example.com',
            description: '',
            password: 'p',
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
            description: 'description',
            password: 'password',
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
        description: 'description',
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
          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            description: 'DESCRIPTION',
            password: 'PASSWORD',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            description: 'DESCRIPTION',
            password: 'PASSWORD',
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
          await prisma.user.create({
            data: {
              user_id: 2,
              username: 'duplicate',
              email: 'duplicate@example.com', // duplicate
              description: 'description',
              password: 'password',
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
            description: 'DESCRIPTION',
            password: 'PASSWORD',
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
          const { user_id } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at: new Date(2001, 2, 4), // updated
            username: 'USERNAME',
            email: 'duplicate@example.com',
            description: 'DESCRIPTION',
            password: 'PASSWORD',
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
            const { user_id, updated_at } = await createUser(prisma);

            const input: z.infer<typeof UserRouterSchema.updateInput> = {
              user_id,
              updated_at,
              username,
              email,
              description: '',
              password,
            };

            //
            await expect(caller.user.update(input)).rejects.toThrow(
              //
              new TRPCError({
                code: 'BAD_REQUEST',
                message: JSON.stringify(message, null, '  '),
              }),
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

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            description: 'DESCRIPTION',
            password: 'PASSWORD',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            description: 'DESCRIPTION',
            password: 'PASSWORD',
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

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'U',
            email: 'E@EXAMPLE.COM',
            description: '',
            password: 'P',
          };

          //
          const output = await caller.user.update(input);

          //
          expect(output).toEqual({
            user_id: expect.anything(),
            username: 'U',
            email: 'E@EXAMPLE.COM',
            description: '',
            password: 'P',
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

          const { user_id, updated_at } = await createUser(prisma);

          const input: z.infer<typeof UserRouterSchema.updateInput> = {
            user_id,
            updated_at,
            username: 'USERNAME',
            email: 'EMAIL@EXAMPLE.COM',
            description: 'DESCRIPTION',
            password: 'PASSWORD',
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
