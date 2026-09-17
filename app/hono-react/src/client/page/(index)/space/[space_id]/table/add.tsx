import { FormProvider } from 'react-hook-form';

import { MyBreadcrumb } from '~/component/MyBreadcrumb';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { Link, useNavigate, useParams } from '~/router';

import { TodoForm } from '../_component/TodoForm';
import { useTodoForm } from '../_component/useTodoForm';

export default function Page() {
  const $params = useParams('/space/:space_id/table/add');
  const $navigate = useNavigate();
  const $toast = useToast();
  const $dialog = useDialog();

  const methods = useTodoForm();

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      await hono.todo.create.$post({ json: value }).unwrap();

      $toast.success('Todo has been saved.');

      return $navigate(
        { pathname: '/space/:space_id/table' },
        { params: { space_id: $params.space_id } },
      );
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
              to="/space/:space_id/table"
              params={{ space_id: $params.space_id }}
              className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-400 hover:text-blue-600"
            >
              <span className="icon-[fontisto--table-2] h-3 w-3 transition"> </span>
              <span className="capitalize">table</span>
            </Link>
            <Link
              to="/space/:space_id/table/add"
              params={{ space_id: $params.space_id }}
              className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
            >
              <span className="capitalize">add todo</span>
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
}
