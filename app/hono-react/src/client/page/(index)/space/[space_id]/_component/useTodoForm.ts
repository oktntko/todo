import type { z } from '@todo/lib';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { TodoRouterSchema } from '@/schema';

export type TodoFormValue = z.input<typeof TodoRouterSchema.createInput>;

export function useTodoForm() {
  return useForm<TodoFormValue>({
    defaultValues: {
      group_id: null,
      title: '',
      description: '',
      begin_date: '',
      begin_time: '',
      limit_date: '',
      limit_time: '',
      order: 0,
      done_at: null,
    },
    resolver: zodResolver(TodoRouterSchema.createInput),
  });
}
