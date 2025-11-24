import { dayjs } from '@todo/lib/dayjs';
import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { ProtectedContext } from '~/middleware/trpc';
import { checkDataExist, checkPreviousVersion } from '~/repository/_repository';
import { WhiteboardRepository } from '~/repository/WhiteboardRepository';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

export const WhiteboardService = {
  listWhiteboard,
  getWhiteboard,
  createWhiteboard,
  updateWhiteboard,
  upsertWhiteboard,
  deleteWhiteboard,
  reorderWhiteboard,
};

// whiteboard.list
async function listWhiteboard(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'listWhiteboard', ctx.operator.user_id);

  const where: Prisma.WhiteboardWhereInput = {
    owner_id: ctx.operator.user_id,
  };

  log.debug(ReqCtx.reqid, 'where', where);

  return WhiteboardRepository.findManyWhiteboard(ctx.prisma, {
    where,
    orderBy: { whiteboard_order: 'asc' },
  });
}

// whiteboard.get
async function getWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.getInput>,
) {
  log.trace(ReqCtx.reqid, 'getWhiteboard', ctx.operator.user_id, input);

  return checkDataExist({
    data: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      where: { whiteboard_id: input.whiteboard_id },
    }),
  });
}

// whiteboard.create
async function createWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createWhiteboard', ctx.operator.user_id, input);

  const count = await WhiteboardRepository.countWhiteboard(ctx.prisma, {
    where: { owner_id: ctx.operator.user_id },
  });

  return WhiteboardRepository.createWhiteboard(ctx.prisma, {
    data: {
      owner_id: ctx.operator.user_id,
      whiteboard_name: input.whiteboard_name,
      whiteboard_description: input.whiteboard_description,
      whiteboard_order: count,
      whiteboard_content: input.whiteboard_content,
    },
    operator_id: ctx.operator.user_id,
  });
}

// whiteboard.update
async function updateWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateWhiteboard', ctx.operator.user_id, input);

  const previous = await checkPreviousVersion({
    previous: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      where: { whiteboard_id: input.whiteboard_id },
    }),
    updated_at: input.updated_at,
  });

  return WhiteboardRepository.updateWhiteboard(ctx.prisma, {
    where: { whiteboard_id: input.whiteboard_id },
    data: {
      owner_id: ctx.operator.user_id,
      whiteboard_name: input.whiteboard_name,
      whiteboard_description: input.whiteboard_description,
      whiteboard_order: previous.whiteboard_order,
      whiteboard_content: input.whiteboard_content,
    },
    operator_id: ctx.operator.user_id,
  });
}

// whiteboard.upsert
async function upsertWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.upsertInput>,
) {
  log.trace(ReqCtx.reqid, 'upsertWhiteboard', ctx.operator.user_id, input);

  if (input.whiteboard_id) {
    return WhiteboardRepository.updateWhiteboard(ctx.prisma, {
      where: { whiteboard_id: input.whiteboard_id },
      data: {
        whiteboard_content: input.whiteboard_content,
      },
      operator_id: ctx.operator.user_id,
    });
  } else {
    return WhiteboardService.createWhiteboard(ctx, {
      whiteboard_name: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      whiteboard_description: '',
      whiteboard_content: input.whiteboard_content,
    });
  }
}

// whiteboard.delete
async function deleteWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteWhiteboard', ctx.operator.user_id, input);

  await checkPreviousVersion({
    previous: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      where: { whiteboard_id: input.whiteboard_id },
    }),
    updated_at: input.updated_at,
  });

  return WhiteboardRepository.deleteWhiteboard(ctx.prisma, {
    where: { whiteboard_id: input.whiteboard_id },
  });
}

// whiteboard.reorder
async function reorderWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.reorderInputList>,
) {
  log.trace(ReqCtx.reqid, 'reorderWhiteboard', ctx.operator.user_id, input);

  return Promise.all(
    input.map((x) =>
      WhiteboardRepository.updateWhiteboard(ctx.prisma, {
        where: { whiteboard_id: x.whiteboard_id },
        data: {
          whiteboard_order: x.whiteboard_order,
        },
        operator_id: ctx.operator.user_id,
      }),
    ),
  );
}
