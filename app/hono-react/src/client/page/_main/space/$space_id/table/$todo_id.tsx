import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate, useParams } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';

import { TodoRouterSchema } from '@/schema';
import { MyBreadcrumb } from '~/component/MyBreadcrumb';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';

import { TodoForm } from '../-component/TodoForm';
import { type TodoFormValue } from '../-component/useTodoForm';

export const Route = createFileRoute('/_main/space/$space_id/table/$todo_id')({
  loader: async function ({ params: $params }) {
    const todo = await hono.todo[':todo_id'].$get({ param: { todo_id: $params.todo_id } }).unwrap();

    return { todo };
  },

  component: function Page() {
    const { todo } = Route.useLoaderData();

    const $params = useParams({ from: '/_main/space/$space_id/table/$todo_id' });
    const $navigate = useNavigate();
    const $toast = useToast();
    const $dialog = useDialog();

    const methods = useForm<TodoFormValue>({
      defaultValues: todo,
      resolver: zodResolver(TodoRouterSchema.createInput),
    });

    const handleSubmit = methods.handleSubmit(async function (value) {
      const loading = $dialog.loading();
      try {
        const _ = await hono.todo.update
          .$post({
            json: {
              ...value,
              todo_id: $params.todo_id,
              updated_at: todo.updated_at,
            },
          })
          .unwrap();

        $toast.success('Todo has been saved.');

        return $navigate({
          to: '/space/$space_id/table',
          params: { space_id: $params.space_id },
        });
      } finally {
        loading.close();
      }
    });

    return (
      <div className="flex h-full flex-col gap-4 px-4 pb-8">
        <div>
          <nav aria-label="Breadcrumb">
            <MyBreadcrumb className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <Link
                to="/space/$space_id/table"
                params={{ space_id: $params.space_id }}
                className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-400 hover:text-blue-600"
              >
                <span className="icon-[fontisto--table-2] h-3 w-3 transition"> </span>
                <span className="capitalize">table</span>
              </Link>
              <Link
                to="/space/$space_id/table/add"
                params={{ space_id: $params.space_id }}
                className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
              >
                <span className="capitalize">edit todo</span>
              </Link>
            </MyBreadcrumb>
          </nav>
        </div>

        <div className="h-full">
          <FormProvider {...methods}>
            <TodoForm onSubmit={handleSubmit} />
          </FormProvider>
        </div>
      </div>
    );
  },
});
