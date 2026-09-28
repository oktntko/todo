import type { InferResponseType } from 'hono';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { TodoRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';

import type { TodoFormValue } from '../-component/useTodoForm';

import { TodoForm } from '../-component/TodoForm';

type ModalEditTodoProps = {
  todo: InferResponseType<typeof hono.todo.list.$post>[number];
  onDone: (todo: InferResponseType<typeof hono.todo.create.$post>) => void;
};

export function ModalEditTodo({ todo, ...props }: ModalEditTodoProps) {
  const $dialog = useDialog();
  const $toast = useToast();

  const methods = useForm<TodoFormValue>({
    defaultValues: todo,
    resolver: zodResolver(TodoRouterSchema.createInput),
  });

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      const updatedTodo = await hono.todo.update
        .$post({
          json: {
            ...value,
            todo_id: todo.todo_id,
            updated_at: todo.updated_at,
          },
        })
        .unwrap();

      $toast.success('Data has been saved.');

      props.onDone(updatedTodo);
    } finally {
      loading.close();
    }
  });

  return (
    <div className="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
      <header className="mb-4 text-lg font-bold capitalize">create new todo</header>

      <FormProvider {...methods}>
        <TodoForm
          onSubmit={handleSubmit}
          buttons={
            <MyButton
              type="button"
              color="yellow"
              variant="outlined"
              onClick={async () => {
                await $dialog.confirm.warn(`Do you really want to delete this data?`);

                const loading = $dialog.loading();
                try {
                  const _ = await hono.todo.delete
                    .$post({
                      json: {
                        todo_id: todo.todo_id,
                        updated_at: todo.updated_at,
                      },
                    })
                    .unwrap();

                  $toast.success('Todo have been deleted.');

                  props.onDone(todo);
                } finally {
                  loading.close();
                }
              }}
            >
              <span className="capitalize">delete</span>
            </MyButton>
          }
        />
      </FormProvider>
    </div>
  );
}
