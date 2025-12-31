import { PrismaClient } from '~/middleware/prisma';

export async function createTodo(
  prisma: PrismaClient,
  overrides: {
    user_id: string;
    group_id: number;
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
  const count = await prisma.todo.count({
    where: { group_id: overrides.group_id },
  });

  return prisma.todo.create({
    data: {
      todo_id,
      group_id: overrides.group_id,
      title: overrides?.title ?? `test-todo-${todo_id.slice(0, 8)}`,
      description: overrides?.description ?? 'test description',
      order: overrides?.order ?? count,
      done_at: overrides?.done_at ?? null,
      begin_date: overrides?.begin_date ?? '',
      begin_time: overrides?.begin_time ?? '',
      limit_date: overrides?.limit_date ?? '',
      limit_time: overrides?.limit_time ?? '',
      created_by: overrides.user_id,
      updated_by: overrides.user_id,
    },
    include: {
      group: true,
      file_list: true,
    },
  });
}
