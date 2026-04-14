import type { z } from '@todo/lib/zod';

import { R } from '@todo/lib/remeda';
import { NotificationStatus } from '@todo/prisma/client';
import { JobsOptions, Queue, Worker } from 'bullmq';

import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { NotificationRepository } from '~/repository/NotificationRepository';
import { NotificationTodoRepository } from '~/repository/NotificationTodoRepository';
import { NotificationRouterSchema } from '~/schema/NotificationRouterSchema';
import { TodoService } from '~/service/TodoService';
import { REDIS_CONNECTION, WORKER_CONCURRENCY } from '~/worker/_worker';
import { ServerSentEventsManager } from '~/worker/ServerSentEvents';

export const NotificationService = {
  listNotification,
  readNotification,
  addNotificationTodo,
  removeNotificationTodo,
};

async function listNotification(
  ctx: ProtectedContext,
  // input: z.infer<typeof GroupRouterSchema.listInput>,
) {
  log.trace(ReqCtx.reqid, 'listNotification', ctx.operator.user_id);

  const [general, todo] = await Promise.all([
    NotificationRepository.findManyNotification(ctx.prisma, {
      where: {
        user_id: ctx.operator.user_id,
        notification_status: {
          in: [NotificationStatus.PLANNING, NotificationStatus.QUEUING, NotificationStatus.UNREAD],
        },
      },
      orderBy: {
        notification_at: 'desc',
      },
    }),
    NotificationTodoRepository.findManyNotificationTodo(ctx.prisma, {
      where: {
        user_id: ctx.operator.user_id,
        notification_status: {
          in: [NotificationStatus.PLANNING, NotificationStatus.QUEUING, NotificationStatus.UNREAD],
        },
      },
      orderBy: {
        notification_at: 'desc',
      },
    }),
  ]);

  const notification_list = R.sortBy(
    [
      ...general.map((x) => ({ type: 'general' as const, ...x })),
      ...todo.map((x) => ({ type: 'todo' as const, ...x })),
    ],
    [(x) => x.notification_at.getTime(), 'desc'],
  );

  return notification_list satisfies z.infer<typeof NotificationRouterSchema.listOutput>;
}

// notification.read
async function readNotification(
  ctx: ProtectedContext,
  input: z.infer<typeof NotificationRouterSchema.getInput>,
) {
  log.trace(ReqCtx.reqid, 'readNotification', ctx.operator.user_id);

  await Promise.all([
    NotificationRepository.updateManyNotification(ctx.prisma, {
      data: {
        notification_status: NotificationStatus.READ,
      },
      where: {
        notification_id: input.notification_id,
        user_id: ctx.operator.user_id,
      },
    }),
    NotificationTodoRepository.updateManyNotificationTodo(ctx.prisma, {
      data: {
        notification_status: NotificationStatus.READ,
      },
      where: {
        notification_id: input.notification_id,
        user_id: ctx.operator.user_id,
      },
    }),
  ]);

  return { ok: true } as const;
}

// notification.addTodo
async function addNotificationTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof NotificationRouterSchema.addNotificationTodoInput>,
) {
  log.trace(ReqCtx.reqid, 'addNotificationTodo', ctx.operator.user_id);

  // 権限チェック
  const todo = await TodoService.getTodo(ctx, input);

  // ジョブID取得のため、通知を登録する
  const notification = await NotificationTodoRepository.createNotificationTodo(ctx.prisma, {
    data: {
      notification_link: `/space/${todo.group.space_id}/todo/table/${todo.todo_id}`,
      notification_title: `It's time for "${todo.title}"`,
      notification_body: [
        todo.begin_date || todo.begin_time
          ? 'BEGIN: ' + [todo.begin_date, todo.begin_time].filter((x) => x).join(' ')
          : '',
        todo.limit_date || todo.limit_time
          ? 'LIMIT: ' + [todo.limit_date, todo.limit_time].filter((x) => x).join(' ')
          : '',
        todo.description,
      ]
        .filter((x) => x)
        .join('\n'),
      notification_status: NotificationStatus.QUEUING,
      notification_at: new Date(Date.now() + input.delay),
      user_id: ctx.operator.user_id,
      todo_id: input.todo_id,
    },
  });

  // queueにジョブを追加する
  await NotificationTodoQueue.add({
    data: {
      notification_id: notification.notification_id,
    },
    opts: {
      delay: input.delay,
    },
  });

  return {
    type: 'todo' as const,
    ...notification,
  } satisfies z.infer<typeof NotificationRouterSchema.getOutput>;
}

// notification.removeTodo
async function removeNotificationTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof NotificationRouterSchema.removeInput>,
) {
  log.trace(ReqCtx.reqid, 'removeNotificationTodo', ctx.operator.user_id);

  // 権限違いでもエラーにしないがデータは消さないため、 user_id を条件に入れる
  // 通知がすでに削除されている場合でもエラーにしないため、 deleteMany を使う
  await NotificationTodoRepository.deleteManyNotificationTodo(ctx.prisma, {
    where: {
      user_id: ctx.operator.user_id,
      notification_id: input.notification_id,
    },
  });

  void NotificationTodoQueue.remove(input);

  return { notification_id: input.notification_id };
}

const NotificationTodoQueue = {
  async add(params: { data: NotificationTodoData; opts?: JobsOptions }) {
    return queue.add(WORKER_NAME, params.data, params.opts); // return job
  },
  async remove(input: { notification_id: string }) {
    const job = await queue.getJob(input.notification_id);
    if (job != null) {
      await job.remove();
    }
  },
};

export type NotificationTodoData = {
  notification_id: string;
};

const WORKER_NAME = 'NotificationTodo';

const queue = new Queue<NotificationTodoData>(WORKER_NAME, { connection: REDIS_CONNECTION });

// ジョブからユーザIDとTODO IDを取得して、SSEで通知する
const worker = new Worker<NotificationTodoData>(
  WORKER_NAME,
  async function (job) {
    const data = job.data;
    log.info(`Processing job ${WORKER_NAME} with data:`, data);
    const prisma = ExtendsPrismaClient;

    const notification = await NotificationTodoRepository.findUniqueNotificationTodo(prisma, {
      where: { notification_id: data.notification_id },
    });

    if (notification == null) {
      return;
    }

    // 権限チェック
    const todo = await TodoService.getTodo(
      {
        prisma,
        operator: {
          user_id: notification.user_id,
        },
      },
      { todo_id: notification.todo_id },
    ).catch(() => null);

    if (todo == null) {
      return; // 権限がない、またはTODOが存在しない場合は何もしないで終了
    }

    // 通知テーブルに書き込み
    const unreadNotification = await NotificationTodoRepository.updateNotificationTodo(prisma, {
      data: {
        notification_status: NotificationStatus.UNREAD,
      },
      where: {
        notification_id: notification.notification_id,
      },
    });

    // 即時通知されるように、Server-Sent Eventsでイベントを送る
    ServerSentEventsManager.send(notification.user_id, {
      type: 'todo',
      ...unreadNotification,
    });
  },
  { connection: REDIS_CONNECTION, concurrency: WORKER_CONCURRENCY },
);

worker.on('completed', (job) => {
  log.trace(WORKER_NAME, job.id, `has completed.`);
});

worker.on('failed', (job, err) => {
  log.error(WORKER_NAME, job?.id, `has failed.`, err.message);
});

// サーバー終了時の処理
process.on('SIGTERM', async () => {
  log.info(WORKER_NAME, 'Closing worker...');
  await worker.close(); // 現在実行中のジョブが完了するのを待って安全に停止
  log.info(WORKER_NAME, 'Worker closed.');
});
