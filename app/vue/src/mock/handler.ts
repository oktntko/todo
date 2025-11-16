import type { TrpcRouter } from '@todo/express';
import type { z } from '@todo/lib/zod';
import type { UserSchema } from '@todo/prisma/schema';
import { TRPCError } from '@trpc/server';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  type InferSelectModel,
} from 'drizzle-orm';
import { http, HttpResponse, type RequestHandler, type WebSocketHandler } from 'msw';
import { createTRPCMsw, httpLink } from 'msw-trpc';
import superjson from 'superjson';
import { drizzle, migrate } from './drizzle';
import { pgSpace, pgTodo, pgUser, pgWhiteboard } from './schema';

await migrate();

const ctx = {
  user: {
    user_id: 1,
    email: 'example@example.com',
    password: 'example@example.com',
    username: 'example',
    avatar_image: '',
    description: '',
    twofa_enable: false,
    twofa_secret: '',
    aichat_enable: false,
    aichat_model: '',
    aichat_api_key: '',
    created_at: new Date(),
    updated_at: new Date(),
  } satisfies z.infer<typeof UserSchema>,
};

const user = await drizzle.query.pgUser.findFirst({
  where: and(eq(pgUser.user_id, ctx.user.user_id)),
});
if (user == null) {
  await drizzle.insert(pgUser).values(ctx.user);
}

const trpcMsw = createTRPCMsw<typeof TrpcRouter>({
  links: [
    httpLink({
      url: `${import.meta.env.BASE_URL}api/trpc`,
    }),
  ],
  transformer: {
    input: superjson,
    output: superjson,
  },
});

export const handlers: Array<RequestHandler | WebSocketHandler> = [
  // aichat
  trpcMsw.aichat.list.query(() => {
    console.trace('aichat.list');
    return [];
  }),
  trpcMsw.aichat.chat.mutation(() => {
    console.trace('aichat.chat');
    return [];
  }),

  // auth
  trpcMsw.auth.signup.mutation(() => {
    console.trace('auth.signup');
    // void
  }),
  trpcMsw.auth.signin.mutation(() => {
    console.trace('auth.signin');
    return {
      auth: true,
    };
  }),
  trpcMsw.auth.signinTwofa.mutation(() => {
    console.trace('auth.signinTwofa');
    return {
      auth: true,
    };
  }),
  trpcMsw.auth.get.query(() => {
    console.trace('auth.get');
    return {
      auth: true,
    };
  }),
  trpcMsw.auth.delete.mutation(() => {
    console.trace('auth.delete');
    // void
  }),

  // file
  http.get<{ file_id: string }>(
    `${import.meta.env.BASE_URL}api/file/download/single/:file_id`,
    () => {
      console.trace('api/file/download/single/:file_id');
      // @ts-expect-error Buffer<ArrayBuffer>
      return HttpResponse.arrayBuffer(Buffer.from('str', 'utf8'), {
        headers: {
          'Content-Disposition': `attachment; filename=${'file.txt'}`,
        },
      });
    },
  ),
  http.get(`${import.meta.env.BASE_URL}api/file/download/many`, () => {
    console.trace('api/file/download/many');
    // @ts-expect-error Buffer<ArrayBuffer>
    return HttpResponse.arrayBuffer(Buffer.from('str', 'utf8'), {
      headers: {
        'Content-Disposition': `attachment; filename=${'file.txt'}`,
      },
    });
  }),
  http.post(`${import.meta.env.BASE_URL}api/file/upload/single`, () => {
    console.trace('api/file/upload/single');
    return HttpResponse.json({
      file_id: '',
      filename: '',
      filesize: 0,
      mimetype: '',
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0,
    });
  }),
  http.post(`${import.meta.env.BASE_URL}api/file/upload/many`, () => {
    console.trace('api/file/upload/many');
    return HttpResponse.json([]);
  }),
  trpcMsw.file.search.query(() => {
    console.trace('file.search');
    return { total: 0, file_list: [] };
  }),
  trpcMsw.file.delete.mutation(() => {
    console.trace('file.delete');
    return {
      file_id: '',
      filename: '',
      filesize: 0,
      mimetype: '',
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0,
    };
  }),
  trpcMsw.file.deleteMany.mutation(() => {
    console.trace('file.deleteMany');
    return [];
  }),

  // mypage
  trpcMsw.mypage.get.query(() => {
    console.trace('mypage.get');
    return ctx.user;
  }),
  trpcMsw.mypage.delete.mutation(() => {
    console.trace('mypage.delete');
    // void
  }),
  trpcMsw.mypage.patchPassword.mutation(() => {
    console.trace('mypage.patchPassword');
    return ctx.user;
  }),
  trpcMsw.mypage.patchProfile.mutation(() => {
    console.trace('mypage.patchProfile');
    return ctx.user;
  }),
  trpcMsw.mypage.generateSecret.mutation(() => {
    console.trace('mypage.generateSecret');
    return {
      dataurl:
        'data:image/png;base64,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',
    };
  }),
  trpcMsw.mypage.enableSecret.mutation(() => {
    console.trace('mypage.enableSecret');
    // void
  }),
  trpcMsw.mypage.disableSecret.mutation(() => {
    console.trace('mypage.disableSecret');
    // void
  }),
  trpcMsw.mypage.patchAichat.mutation(() => {
    console.trace('mypage.patchAichat');
    return ctx.user;
  }),

  // space
  // @ts-expect-error space_color
  trpcMsw.space.list.query(async () => {
    console.trace('space.list');
    return drizzle.select().from(pgSpace).orderBy(asc(pgSpace.space_order));
  }),
  // @ts-expect-error space_color
  trpcMsw.space.get.query(async ({ input }) => {
    console.trace('space.get', input);
    const space = await drizzle.query.pgSpace.findFirst({
      where: and(eq(pgSpace.space_id, input.space_id)),
    });
    if (!space) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'スペースが存在しません',
      });
    }
    return space;
  }),
  // @ts-expect-error space_color
  trpcMsw.space.create.mutation(async ({ input }) => {
    console.trace('space.create', input);
    // space_orderは自動採番
    const count = await drizzle
      .select()
      .from(pgSpace)
      .then((rows) => rows.length);

    const [space] = await drizzle
      .insert(pgSpace)
      .values({
        owner_id: ctx.user.user_id,
        space_name: input.space_name,
        space_description: input.space_description,
        space_order: count,
        space_image: input.space_image,
        space_color: input.space_color,
        created_by: ctx.user.user_id,
        updated_by: ctx.user.user_id,
      })
      .returning();

    return space!;
  }),
  // @ts-expect-error space_color
  trpcMsw.space.update.mutation(async ({ input }) => {
    console.trace('space.update', input);
    // 楽観ロックやバージョンチェックは省略
    const [space] = await drizzle
      .update(pgSpace)
      .set({
        space_name: input.space_name,
        space_description: input.space_description,
        space_image: input.space_image,
        space_color: input.space_color,
        updated_by: ctx.user.user_id,
        updated_at: new Date(),
      })
      .where(and(eq(pgSpace.space_id, input.space_id)))
      .returning();

    if (!space) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'スペースが存在しません' });
    }
    return space;
  }),
  // @ts-expect-error space_color
  trpcMsw.space.delete.mutation(async ({ input }) => {
    console.trace('space.delete', input);
    // 楽観ロックやバージョンチェックは省略
    const [space] = await drizzle
      .delete(pgSpace)
      .where(and(eq(pgSpace.space_id, input.space_id)))
      .returning();

    if (!space) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'スペースが存在しません' });
    }
    return space;
  }),
  // @ts-expect-error space_color
  trpcMsw.space.reorder.mutation(async ({ input }) => {
    console.trace('space.reorder', input);
    const updated: InferSelectModel<typeof pgSpace>[] = [];
    for (const x of input) {
      const [space] = await drizzle
        .update(pgSpace)
        .set({
          space_order: x.space_order,
          updated_by: ctx.user.user_id,
          updated_at: new Date(),
        })
        .where(and(eq(pgSpace.space_id, x.space_id)))
        .returning();
      if (space) {
        updated.push(space);
      }
    }
    return updated;
  }),

  // todo
  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.list.query(async (args) => {
    console.trace('todo.list', args?.input);
    return findManyTodo(args);
  }),

  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.search.query(async ({ input }) => {
    console.trace('todo.search', input);
    const where = [];
    if (input.where.space_id_list!.length > 0) {
      where.push(or(...input.where.space_id_list!.map((id) => eq(pgTodo.space_id, id))));
    }
    if (input.where.todo_keyword) {
      where.push(
        or(
          ilike(pgTodo.title, `%${input.where.todo_keyword}%`),
          ilike(pgTodo.description, `%${input.where.todo_keyword}%`),
        ),
      );
    }
    if (
      input.where.todo_status?.length > 0 &&
      input.where.todo_status.length !== 2 // active/done両方でなければ
    ) {
      where.push(
        or(
          ...input.where.todo_status.map((status) =>
            status === 'active' ? isNull(pgTodo.done_at) : isNotNull(pgTodo.done_at),
          ),
        ),
      );
    }

    const orderBy =
      input.sort.field === 'space'
        ? asc(pgTodo.order)
        : input.sort.order === 'desc'
          ? desc(pgTodo[input.sort.field])
          : asc(pgTodo[input.sort.field]);

    const total = await drizzle
      .select({ count: count() })
      .from(pgTodo)
      .where(and(...where))
      .then((rows) => Number(rows[0]?.count ?? 0));

    const todo_list = await drizzle.query.pgTodo
      .findMany({
        with: {
          file_list: {
            with: {
              file: true,
            },
          },
          space: true,
        },
        where: and(...where),
        orderBy,
        limit: input.limit,
        offset: input.limit * (input.page - 1),
      })
      .then((todo_list) =>
        todo_list.map((todo) => ({
          ...todo,
          file_list: todo.file_list.map((file) => file.file),
        })),
      );

    return {
      total,
      todo_list,
    };
  }),

  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.get.query(async (args) => {
    console.trace('todo.get', args.input);
    return findUniqueTodo(args);
  }),

  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.upsert.mutation(async ({ input }) => {
    console.trace('todo.upsert', input);
    // upsert: 存在すればupdate、なければinsert
    const current = await drizzle.query.pgTodo.findFirst({
      where: eq(pgTodo.todo_id, input.todo_id),
    });

    const [todo] = current
      ? await drizzle
          .update(pgTodo)
          .set({
            space_id: input.space_id,
            title: input.title,
            description: input.description,
            begin_date: input.begin_date,
            begin_time: input.begin_time,
            limit_date: input.limit_date,
            limit_time: input.limit_time,
            order: input.order,
            done_at: input.done_at as Date | null,
            updated_at: new Date(),
            updated_by: ctx.user.user_id,
          })
          .where(eq(pgTodo.todo_id, input.todo_id))
          .returning()
      : await drizzle
          .insert(pgTodo)
          .values({
            todo_id: input.todo_id,
            space_id: input.space_id,
            title: input.title,
            description: input.description,
            begin_date: input.begin_date,
            begin_time: input.begin_time,
            limit_date: input.limit_date,
            limit_time: input.limit_time,
            order: input.order,
            done_at: input.done_at as Date | null | undefined,
            created_at: new Date(),
            created_by: ctx.user.user_id,
            updated_at: new Date(),
            updated_by: ctx.user.user_id,
          })
          .returning();

    return findUniqueTodo({ input: todo! });
  }),

  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.create.mutation(async ({ input }) => {
    console.trace('todo.create', input);
    const [todo] = await drizzle
      .insert(pgTodo)
      .values({
        space_id: input.space_id,
        title: input.title,
        description: input.description,
        begin_date: input.begin_date,
        begin_time: input.begin_time,
        limit_date: input.limit_date,
        limit_time: input.limit_time,
        order: input.order,
        done_at: input.done_at as Date | null | undefined,
        created_at: new Date(),
        created_by: ctx.user.user_id,
        updated_at: new Date(),
        updated_by: ctx.user.user_id,
      })
      .returning();

    return findUniqueTodo({ input: todo! });
  }),

  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.update.mutation(async ({ input }) => {
    console.trace('todo.update', input);
    const [todo] = await drizzle
      .update(pgTodo)
      .set({
        space_id: input.space_id,
        title: input.title,
        description: input.description,
        begin_date: input.begin_date,
        begin_time: input.begin_time,
        limit_date: input.limit_date,
        limit_time: input.limit_time,
        order: input.order,
        done_at: input.done_at as Date | null | undefined,
        updated_at: new Date(),
        updated_by: ctx.user.user_id,
      })
      .where(eq(pgTodo.todo_id, input.todo_id))
      .returning();

    if (!todo) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'TODOが存在しません' });
    }

    return findUniqueTodo({ input: todo! });
  }),

  trpcMsw.todo.updateMany.mutation(async ({ input }) => {
    console.trace('todo.updateMany', input);
    const todo_list: InferSelectModel<typeof pgTodo>[] = [];
    for (const item of input.list) {
      const [todo] = await drizzle
        .update(pgTodo)
        .set({
          space_id: input.space_id,
          title: input.title,
          description: input.description,
          begin_date: input.begin_date,
          begin_time: input.begin_time,
          limit_date: input.limit_date,
          limit_time: input.limit_time,
          order: input.order,
          done_at: input.done_at as Date | null | undefined,
          updated_at: new Date(),
          updated_by: ctx.user.user_id,
        })
        .where(eq(pgTodo.todo_id, item.todo_id))
        .returning();
      if (todo) {
        todo_list.push(todo);
      }
    }

    return findManyTodo({
      input: {
        space_id_list: todo_list.map((x) => x.space_id),
      },
    });
  }),

  // @ts-expect-error space_color begin_date begin_time limit_date limit_time
  trpcMsw.todo.delete.mutation(async ({ input }) => {
    console.trace('todo.delete', input);
    const [todo] = await drizzle
      .delete(pgTodo)
      .where(eq(pgTodo.todo_id, input.todo_id))
      .returning();

    if (!todo) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'TODOが存在しません' });
    }

    return findUniqueTodo({ input: todo });
  }),

  trpcMsw.todo.deleteMany.mutation(async ({ input }) => {
    console.trace('todo.deleteMany', input);
    const todo_list: InferSelectModel<typeof pgTodo>[] = [];

    for (const item of input) {
      const [result] = await drizzle
        .delete(pgTodo)
        .where(eq(pgTodo.todo_id, item.todo_id))
        .returning();

      if (result) {
        todo_list.push(result);
      }
    }

    return todo_list;
  }),

  // whiteboard
  trpcMsw.whiteboard.list.query(async () => {
    console.trace('whiteboard.list');
    // ログインユーザーのホワイトボードのみ
    return drizzle.select().from(pgWhiteboard).orderBy(asc(pgWhiteboard.whiteboard_order));
  }),

  trpcMsw.whiteboard.get.query(async ({ input }) => {
    console.trace('whiteboard.get', input);
    const whiteboard = await drizzle.query.pgWhiteboard.findFirst({
      where: eq(pgWhiteboard.whiteboard_id, input.whiteboard_id),
    });
    if (!whiteboard) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'ホワイトボードが存在しません',
      });
    }
    return whiteboard;
  }),

  trpcMsw.whiteboard.create.mutation(async ({ input }) => {
    console.trace('whiteboard.create', input);
    // whiteboard_orderは自動採番
    const count = await drizzle
      .select()
      .from(pgWhiteboard)
      .then((rows) => rows.length);

    const [whiteboard] = await drizzle
      .insert(pgWhiteboard)
      .values({
        owner_id: ctx.user.user_id,
        whiteboard_name: input.whiteboard_name,
        whiteboard_description: input.whiteboard_description,
        whiteboard_order: count,
        whiteboard_content: input.whiteboard_content,
        created_by: ctx.user.user_id,
        updated_by: ctx.user.user_id,
      })
      .returning();

    return whiteboard!;
  }),

  trpcMsw.whiteboard.update.mutation(async ({ input }) => {
    console.trace('whiteboard.update', input);
    // 楽観ロックやバージョンチェックは省略
    const [whiteboard] = await drizzle
      .update(pgWhiteboard)
      .set({
        whiteboard_name: input.whiteboard_name,
        whiteboard_description: input.whiteboard_description,
        whiteboard_content: input.whiteboard_content,
        updated_by: ctx.user.user_id,
        updated_at: new Date(),
      })
      .where(eq(pgWhiteboard.whiteboard_id, input.whiteboard_id))
      .returning();

    if (!whiteboard) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'ホワイトボードが存在しません' });
    }
    return whiteboard;
  }),

  trpcMsw.whiteboard.upsert.mutation(async ({ input }) => {
    console.trace('whiteboard.upsert', input);
    if (input.whiteboard_id) {
      // update
      const [whiteboard] = await drizzle
        .update(pgWhiteboard)
        .set({
          whiteboard_content: input.whiteboard_content,
          updated_by: ctx.user.user_id,
          updated_at: new Date(),
        })
        .where(eq(pgWhiteboard.whiteboard_id, input.whiteboard_id))
        .returning();

      if (!whiteboard) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'ホワイトボードが存在しません' });
      }
      return whiteboard;
    } else {
      // create
      const count = await drizzle
        .select()
        .from(pgWhiteboard)
        .where(eq(pgWhiteboard.owner_id, ctx.user.user_id))
        .then((rows) => rows.length);

      const [whiteboard] = await drizzle
        .insert(pgWhiteboard)
        .values({
          owner_id: ctx.user.user_id,
          whiteboard_name: new Date().toISOString(),
          whiteboard_description: '',
          whiteboard_order: count,
          whiteboard_content: input.whiteboard_content,
          created_by: ctx.user.user_id,
          updated_by: ctx.user.user_id,
        })
        .returning();

      return whiteboard!;
    }
  }),

  trpcMsw.whiteboard.delete.mutation(async ({ input }) => {
    console.trace('whiteboard.delete', input);
    const [whiteboard] = await drizzle
      .delete(pgWhiteboard)
      .where(eq(pgWhiteboard.whiteboard_id, input.whiteboard_id))
      .returning();

    if (!whiteboard) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'ホワイトボードが存在しません' });
    }
    return whiteboard;
  }),

  trpcMsw.whiteboard.reorder.mutation(async ({ input }) => {
    console.trace('whiteboard.reorder', input);
    const updated: InferSelectModel<typeof pgWhiteboard>[] = [];
    for (const x of input) {
      const [whiteboard] = await drizzle
        .update(pgWhiteboard)
        .set({
          whiteboard_order: x.whiteboard_order,
          updated_by: ctx.user.user_id,
          updated_at: new Date(),
        })
        .where(eq(pgWhiteboard.whiteboard_id, x.whiteboard_id))
        .returning();
      if (whiteboard) {
        updated.push(whiteboard);
      }
    }
    return updated;
  }),
];

async function findUniqueTodo({ input }: { input: { todo_id: string } }) {
  const todo = await drizzle.query.pgTodo.findFirst({
    with: {
      file_list: {
        with: {
          file: true,
        },
      },
      space: true,
    },
    where: eq(pgTodo.todo_id, input.todo_id),
  });

  if (!todo) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'TODOが存在しません' });
  }

  return {
    ...todo,
    file_list: todo.file_list.map((file) => file.file),
  };
}

async function findManyTodo({
  input,
}: {
  input: { space_id_list?: number[]; todo_status?: string };
}) {
  const where = [];
  if ((input.space_id_list?.length ?? 0) > 0) {
    where.push(or(...input.space_id_list!.map((id) => eq(pgTodo.space_id, id))));
  }
  if (input.todo_status === 'active') {
    where.push(isNull(pgTodo.done_at));
  } else if (input.todo_status === 'done') {
    where.push(isNotNull(pgTodo.done_at));
  }

  return drizzle.query.pgTodo
    .findMany({
      with: {
        file_list: {
          with: {
            file: true,
          },
        },
        space: true,
      },
      where: and(...where),
      orderBy: asc(pgTodo.order),
    })
    .then((todo_list) =>
      todo_list.map((todo) => ({
        ...todo,
        file_list: todo.file_list.map((file) => file.file),
      })),
    );
}
