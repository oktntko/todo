import type { InferResponseType } from 'hono';

import { zodResolver } from '@hookform/resolvers/zod';
import { dayjs, z } from '@todo/lib';
import { TodoStatusList } from '@todo/prisma/schema';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { TodoRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyCheckbox } from '~/component/input/MyCheckbox';
import { MyInput } from '~/component/input/MyInput';
import { MyBreadcrumb } from '~/component/MyBreadcrumb';
import { MySortButton } from '~/component/MySortButton';
import { cn } from '~/lib/cn';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { Link, useParams } from '~/router';

export default function Page() {
  const $params = useParams('/space/:space_id/table');
  const $dialog = useDialog();
  const $toast = useToast();

  const {
    handleSubmit: validateSubmit,
    register,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    defaultValues: {
      space_id: $params.space_id,
      where: {
        group_id_list: [],
        todo_keyword: '',
        todo_status: [TodoStatusList[0]],
      },
      sort: {
        field: 'updated_at',
        order: 'desc',
      },
      limit: 50,
      page: 1,
    },
    resolver: zodResolver(TodoRouterSchema.searchInput),
  });
  const [sort, limit, page] = useWatch({ control, name: ['sort', 'limit', 'page'] });

  const [data, setData] = useState<{
    total: number;
    todo_list: (InferResponseType<typeof hono.todo.search.$post>['todo_list'][number] & {
      checked?: boolean;
    })[];
  }>({
    total: 0,
    todo_list: [],
  });

  const [loading, setLoading] = useState(true);

  const handleSubmit = validateSubmit(async (modelValue) => {
    setLoading(true);
    try {
      setData(await hono.todo.search.$post({ json: modelValue }).unwrap());
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void handleSubmit();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeSortOrder(
    field: z.infer<typeof TodoRouterSchema.searchInput>['sort']['field'],
  ) {
    if (sort.field !== field) {
      setValue('sort', {
        field,
        order: 'asc',
      });
    } else {
      setValue('sort', {
        field,
        order: sort.order === 'asc' ? 'desc' : 'asc',
      });
    }

    return handleSubmit();
  }

  const checkedList = data.todo_list.filter((x) => x.checked);
  const headerCheckbox = {
    checked: checkedList.length > 0,
    indeterminate: checkedList.length > 0 && checkedList.length < data.todo_list.length,
  };

  return (
    <div className="mb-8 flex flex-col gap-4 px-4">
      <div>
        <nav aria-label="Breadcrumb">
          <MyBreadcrumb className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <Link
              to="/space/:space_id/table"
              params={{ space_id: $params.space_id }}
              className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
            >
              <span className="icon-[fontisto--table-2] h-3 w-3 transition"> </span>
              <span className="capitalize">table</span>
            </Link>
          </MyBreadcrumb>
        </nav>
      </div>

      <div>
        <form
          className="flex flex-col gap-6"
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault();
            return handleSubmit();
          }}
        >
          <section className="flex flex-col gap-3">
            <div className="focus-container flex flex-col gap-0.5">
              <div>
                <label htmlFor="where.todo_keyword" className="optional text-sm capitalize">
                  keyword
                </label>
              </div>

              <div>
                <MyInput
                  id="where.todo_keyword"
                  className="w-full"
                  maxLength={100}
                  {...register('where.todo_keyword')}
                />
              </div>

              <ErrorMessage>{errors.where?.todo_keyword?.message}</ErrorMessage>
            </div>

            <div className="focus-container flex flex-col gap-0.5">
              <div>
                <label
                  htmlFor={`status-${TodoStatusList[0]}`}
                  className="optional text-sm capitalize"
                >
                  status
                </label>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                {TodoStatusList.map((todo_status) => (
                  <MyCheckbox
                    id={`status-${todo_status}`}
                    key={todo_status}
                    type="checkbox"
                    value={todo_status}
                    {...register('where.todo_status')}
                  >
                    <span className="capitalize">{todo_status}</span>
                  </MyCheckbox>
                ))}
              </div>

              <ErrorMessage>{errors.where?.todo_status?.message}</ErrorMessage>
            </div>
          </section>

          <section className="flex gap-2">
            <MyButton type="submit" color="green" variant="contained" disabled={loading}>
              <span className="icon-[bx--search] h-4 w-4"></span>
              <span className="capitalize">search</span>
            </MyButton>
          </section>
        </form>
      </div>

      <div>
        <header className="z-10 flex flex-row items-center gap-2 rounded-t border border-gray-300 bg-gray-50 p-2 px-4 py-2 text-sm">
          <MyButton
            tag={Link}
            color="blue"
            to="/space/:space_id/table/add"
            params={{ space_id: $params.space_id }}
          >
            <span className="icon-[icon-park-solid--add-one] h-4 w-4"></span>
            <span className="capitalize">add todo</span>
          </MyButton>
          <MyButton
            type="button"
            color="green"
            disabled={loading || checkedList.length === 0}
            onClick={async () => {
              await $dialog.confirm.warn(`Do you really want to done checked data?`);

              setLoading(true);
              try {
                await hono.todo.updateMany.$post({
                  json: {
                    space_id: $params.space_id,
                    data: {
                      done_at: new Date(),
                    },
                    target_list: checkedList,
                  },
                });
                $toast.success('Todo have been done.');

                await handleSubmit();
              } finally {
                setLoading(false);
              }
            }}
          >
            <span className="icon-[material-symbols--check-circle-outline-rounded] h-4 w-4"></span>
            <span className="capitalize">done</span>
          </MyButton>
          <MyButton
            type="button"
            disabled={loading || checkedList.length === 0}
            onClick={async () => {
              const file_id_list = checkedList.flatMap((x) => x.file_list).map((x) => x.file_id);
              if (file_id_list.length === 0) {
                return $dialog.alert.info('There are no files in the checked line.');
              }

              setLoading(true);
              try {
                await hono.file.download.many.$get({ query: { file_id_list } });
              } finally {
                setLoading(false);
              }
            }}
          >
            <span className="icon-[simple-line-icons--cloud-download] h-4 w-4"></span>
            <span className="capitalize">download</span>
          </MyButton>
          <MyButton
            type="button"
            disabled={loading || checkedList.length === 0}
            onClick={async () => {
              await $dialog.confirm.warn(`Do you really want to delete checked data?`);

              setLoading(true);
              try {
                await hono.todo.deleteMany.$post({
                  json: {
                    space_id: $params.space_id,
                    target_list: checkedList,
                  },
                });
                $toast.success('Todo have been deleted.');

                await handleSubmit();
              } finally {
                setLoading(false);
              }
            }}
          >
            <span className="icon-[tabler--trash-filled] h-4 w-4"></span>
            <span className="capitalize">delete</span>
          </MyButton>
        </header>

        <table className="h-full w-full overflow-x-auto rounded-sm border border-gray-300 bg-gray-50 text-sm">
          <thead className="text-gray-900">
            <tr className="divide-x divide-gray-200">
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                No
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <label className="flex h-full justify-center hover:cursor-pointer">
                  <input
                    type="checkbox"
                    name="header-checkbox"
                    className="hover:cursor-pointer"
                    defaultChecked={headerCheckbox.checked}
                    // indeterminate={headerCheckbox.indeterminate}
                    onClick={() => {
                      const checked = headerCheckbox.checked;
                      setData((prev) => {
                        return {
                          total: prev.total,
                          todo_list: prev.todo_list.map((x) => ({ ...x, checked: !checked })),
                        };
                      });
                    }}
                  />
                </label>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  group
                  <MySortButton
                    sort={sort}
                    field="group"
                    onClick={() => changeSortOrder('group')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  title
                  <MySortButton
                    sort={sort}
                    field="title"
                    onClick={() => changeSortOrder('title')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  begin
                  <MySortButton
                    sort={sort}
                    field="begin_date"
                    onClick={() => changeSortOrder('begin_date')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  limit
                  <MySortButton
                    sort={sort}
                    field="limit_date"
                    onClick={() => changeSortOrder('limit_date')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  description
                  <MySortButton
                    sort={sort}
                    field="description"
                    onClick={() => changeSortOrder('description')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                files
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  done
                  <MySortButton
                    sort={sort}
                    field="done_at"
                    onClick={() => changeSortOrder('done_at')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  created
                  <MySortButton
                    sort={sort}
                    field="created_at"
                    onClick={() => changeSortOrder('created_at')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                className={cn(
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                )}
              >
                <div className="flex items-center justify-center">
                  updated
                  <MySortButton
                    sort={sort}
                    field="updated_at"
                    onClick={() => changeSortOrder('updated_at')}
                  ></MySortButton>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
            {data.todo_list.map((todo, i) => (
              <tr key={todo.todo_id} className="divide-x divide-gray-200">
                <td className="max-w-48">
                  <Link
                    to="/space/:space_id/table/:todo_id"
                    params={{
                      space_id: $params.space_id,
                      todo_id: todo.todo_id,
                    }}
                    className="flex w-full justify-end px-2 py-1 text-blue-600 hover:underline"
                  >
                    #{i + 1}
                  </Link>
                </td>
                <td className="max-w-48">
                  <label className="flex h-full justify-center hover:cursor-pointer">
                    <input
                      name="row-checkbox"
                      type="checkbox"
                      className="hover:cursor-pointer"
                      defaultChecked={todo.checked}
                    />
                  </label>
                </td>
                <td className="max-w-48">
                  <div
                    className="line-clamp-1 flex min-w-28 items-center gap-0.5 px-2 py-1"
                    title={todo.group.group_name}
                  >
                    {todo.group.group_image ? (
                      <img
                        src={todo.group.group_image}
                        width="16"
                        height="16"
                        decoding="async"
                        className="h-4 w-4 rounded-sm object-cover object-center"
                      />
                    ) : (
                      <span className="icon-[ri--image-circle-fill] h-4 w-4"></span>
                    )}
                    <span> {todo.group.group_name} </span>
                  </div>
                </td>
                <td className="max-w-48">
                  <div className="line-clamp-2 min-w-28 px-2 py-1" title={todo.title}>
                    {todo.title}
                  </div>
                </td>
                <td className="max-w-48">
                  <div className="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.begin_date} {todo.begin_time}
                  </div>
                </td>
                <td className="max-w-48">
                  <div className="line-clamp-1 min-w-28 px-2 py-1">
                    {todo.limit_date} {todo.limit_time}
                  </div>
                </td>
                <td className="max-w-48">
                  <div
                    className="line-clamp-4 min-w-28 px-2 py-1 wrap-break-word whitespace-pre-wrap"
                    title={todo.description}
                  >
                    {todo.description}
                  </div>
                </td>
                <td className="max-w-48">
                  <div
                    className="line-clamp-4 min-w-28 px-2 py-1 break-all"
                    title={todo.file_list.map((x) => x.filename).join(',')}
                  >
                    {todo.file_list.map((file) => (
                      <span key={file.file_id} className="mr-1 text-xs">
                        {file.filename}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="max-w-48">
                  <div className="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.done_at ? dayjs(todo.done_at).format('YYYY-MM-DD') : ''}
                  </div>
                </td>
                <td className="max-w-48">
                  <div className="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.created_at
                      ? dayjs(todo.created_at).format('YYYY-MM-DD hh:mm:ss.SSS')
                      : ''}
                  </div>
                </td>
                <td className="max-w-48">
                  <div className="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.updated_at
                      ? dayjs(todo.updated_at).format('YYYY-MM-DD hh:mm:ss.SSS')
                      : ''}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="sticky bottom-0 z-10 flex flex-row items-center gap-4 rounded-b border border-gray-300 bg-gray-50 px-4 py-2 text-sm">
          {/* https://www.delldesignsystem.com/components/pagination/ */}
          <div className="flex flex-row items-center gap-2">
            <span className="capitalize">items per page</span>
            <select
              className="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
              disabled={loading}
              {...register('limit')}
              name="limit"
              onChange={() => {
                setValue('page', 1);
                return handleSubmit();
              }}
            >
              {[10, 50, 100, 200, 500].map((_limit) => (
                <option key={_limit} disabled={_limit === limit}>
                  {_limit}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-row items-center gap-2">
            <span className="min-w-4 text-right">
              {Math.min(data.total, limit * (page - 1) + 1)}
            </span>
            -<span className="min-w-4 text-right">{Math.min(data.total, limit * page)}</span>
            <span> of {data.total} items </span>
          </div>

          <div className="flex flex-row items-center gap-2">
            <div className="relative inline-block">
              <input
                type="range"
                min="1"
                max={Math.ceil(data.total / limit)}
                className="h-2 cursor-pointer rounded-lg bg-gray-200"
                disabled={loading}
                {...register('page')}
                onChange={handleSubmit}
              />
              <span className="absolute inset-e-0 -top-3 text-xs text-gray-500"> max </span>
              <span className="absolute inset-e-0 -bottom-3 text-xs text-gray-500">
                {Math.ceil(data.total / limit)}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max={Math.ceil(data.total / limit)}
              step="1"
              className="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-gray-900"
              disabled={loading}
              {...register('page')}
              onChange={handleSubmit}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
