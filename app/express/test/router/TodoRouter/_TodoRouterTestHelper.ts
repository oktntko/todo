import { SpaceUserRole } from '@todo/prisma/client';

import { PrismaClient } from '~/middleware/prisma';

import { addTestGroup } from '../GroupRouter/_GroupRouterTestHelper';
import { createTestSpace } from '../SpaceRouter/_SpaceRouterTestHelper';

export async function createTestSpaceGroupAndAddTodo(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  role: SpaceUserRole | undefined,
  overrides?: {
    title?: string;
    description?: string;
    order?: number;
    done_at?: Date | null;
    begin_date?: string | null;
    begin_time?: string | null;
    limit_date?: string | null;
    limit_time?: string | null;
  },
) {
  const space = await createTestSpace(prisma, { user_id }, role);
  const group = await addTestGroup(prisma, { user_id }, space);

  return addTestTodo(prisma, { user_id }, group, overrides);
}

export async function addTestTodo(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  { group_id }: { group_id: string },
  overrides?: {
    title?: string;
    description?: string;
    order?: number;
    done_at?: Date | null;
    begin_date?: string | null;
    begin_time?: string | null;
    limit_date?: string | null;
    limit_time?: string | null;
  },
) {
  const todo_id = crypto.randomUUID();

  return prisma.todo.create({
    data: {
      todo_id,
      group_id,
      title: overrides?.title ?? `test-todo-${todo_id.slice(0, 8)}`,
      description: overrides?.description ?? 'test description',
      order: overrides?.order ?? 0,
      done_at: overrides?.done_at ?? null,
      begin_date: overrides?.begin_date ?? '',
      begin_time: overrides?.begin_time ?? '',
      limit_date: overrides?.limit_date ?? '',
      limit_time: overrides?.limit_time ?? '',
      created_by: user_id,
      updated_by: user_id,
    },
    include: {
      group: true,
      file_list: true,
    },
  });
}
