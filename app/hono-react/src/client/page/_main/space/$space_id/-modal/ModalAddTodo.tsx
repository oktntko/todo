import type { InferResponseType } from 'hono';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { TodoRouterSchema } from '@/schema';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';

import type { TodoFormValue } from '../-component/useTodoForm';

import { TodoForm } from '../-component/TodoForm';

type ModalAddTodoProps = {
  space_id: string;
  group_id?: string | null;
  begin_date?: '' | `${number}-${number}-${number}`;
  begin_time?: '' | `${number}:${number}`;
  limit_date?: '' | `${number}-${number}-${number}`;
  limit_time?: '' | `${number}:${number}`;
  onDone: (todo: InferResponseType<typeof hono.todo.create.$post>) => void;
};

export function ModalAddTodo($props: ModalAddTodoProps) {
  const $dialog = useDialog();
  const $toast = useToast();

  const methods = useForm<TodoFormValue>({
    defaultValues: {
      group_id: $props.group_id ?? null,
      title: '',
      description: '',
      begin_date: $props.begin_date ?? '',
      begin_time: $props.begin_time ?? '',
      limit_date: $props.limit_date ?? '',
      limit_time: $props.limit_time ?? '',
      order: 0,
      done_at: null,
    },
    resolver: zodResolver(TodoRouterSchema.createInput),
  });

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      const todo = await hono.todo.create.$post({ json: value }).unwrap();

      $toast.success('Todo has been saved.');

      $props.onDone(todo);
    } finally {
      loading.close();
    }
  });

  return (
    <div className="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
      <header className="mb-4 text-lg font-bold capitalize">add todo</header>

      <FormProvider {...methods}>
        <TodoForm onSubmit={handleSubmit} />
      </FormProvider>
    </div>
  );
}
