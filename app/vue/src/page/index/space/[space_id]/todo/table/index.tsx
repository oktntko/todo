import type { z } from '@todo/lib/zod';

import { TodoRouterSchema } from '@todo/express/schema';
import { dayjs } from '@todo/lib/dayjs';
import { TodoStatusList } from '@todo/prisma/schema';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import MyButton from '~/component/button/MyButton';
import MyCheckbox from '~/component/input/MyCheckbox.vue';
import MyInput from '~/component/input/MyInput.vue';
import MySortButton from '~/component/MySortButton.vue';
import MyBreadcrumb from '~/component/navi/MyBreadcrumb.vue';
import { useFile } from '~/composable/useFile';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]/todo/table/');
  const $dialog = useDialog();
  const $toast = useToast();

  const { downloadManyFiles } = useFile();

  const modelValue = ref<z.infer<typeof TodoRouterSchema.searchInput>>({
    space_id: $route.params.space_id,
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
  });

  const data = ref<{
    total: number;
    todo_list: (RouterOutput['todo']['search']['todo_list'][number] & { checked?: boolean })[];
  }>({
    total: 0,
    todo_list: [],
  });

  const loading = ref(true);

  const { validate, ErrorMessage } = useVueValidateZod(TodoRouterSchema.searchInput, modelValue);
  async function handleSubmit() {
    const result = await validate();
    if (!result.success) return;

    loading.value = true;
    try {
      data.value = await trpc.todo.search.query(modelValue.value);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    handleSubmit();
  });

  async function changeSortOrder(field: typeof modelValue.value.sort.field) {
    if (modelValue.value.sort.field !== field) {
      modelValue.value.sort = {
        field: field,
        order: 'asc',
      };
    } else {
      modelValue.value.sort.order = modelValue.value.sort.order === 'asc' ? 'desc' : 'asc';
    }

    return handleSubmit();
  }

  const checkedList = computed(() => {
    return data.value.todo_list.filter((x) => x.checked);
  });
  const headerCheckbox = computed(() => {
    return {
      checked: checkedList.value.length > 0,
      indeterminate:
        checkedList.value.length > 0 && checkedList.value.length < data.value.todo_list.length,
    };
  });

  return () => (
    <div class="mb-8 flex flex-col gap-4 px-4">
      <div>
        <nav aria-label="Breadcrumb">
          <MyBreadcrumb class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <RouterLink
              to={{
                name: '//space/[space_id]/todo/table/',
                params: {
                  space_id: $route.params.space_id,
                },
              }}
              class="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
            >
              <span class="icon-[fontisto--table-2] h-3 w-3 transition duration-75"> </span>
              <span class="capitalize">table</span>
            </RouterLink>
          </MyBreadcrumb>
        </nav>
      </div>

      <div>
        <form
          class="flex flex-col gap-6"
          autocomplete="off"
          onSubmit={async (e) => {
            e.preventDefault();
            return handleSubmit();
          }}
        >
          <section class="flex flex-col gap-3">
            <div class="focus-container flex flex-col gap-0.5">
              <div>
                <label for="where.todo_keyword" class="optional text-sm capitalize">
                  keyword
                </label>
              </div>

              <div>
                <MyInput
                  id="where.todo_keyword"
                  v-model={modelValue.value.where.todo_keyword}
                  class="w-full"
                  maxlength="100"
                />
              </div>

              <ErrorMessage class="text-xs text-red-600" field="where.todo_keyword" />
            </div>

            <div class="focus-container flex flex-col gap-0.5">
              <div>
                <label for={`status-${TodoStatusList[0]}`} class="optional text-sm capitalize">
                  status
                </label>
              </div>

              <div class="flex flex-col gap-1 sm:flex-row sm:gap-3">
                {TodoStatusList.map((todo_status) => (
                  <MyCheckbox
                    id={`status-${todo_status}`}
                    key={todo_status}
                    v-model={modelValue.value.where.todo_status}
                    type="checkbox"
                    value={todo_status}
                  >
                    <span class="capitalize">{todo_status}</span>
                  </MyCheckbox>
                ))}
              </div>

              <ErrorMessage class="text-xs text-red-600" field="where.todo_status" />
            </div>
          </section>

          <section class="flex gap-2">
            <MyButton type="submit" color="green" variant="contained" disabled={loading.value}>
              <span class="icon-[bx--search] h-4 w-4"></span>
              <span class="capitalize">search</span>
            </MyButton>
          </section>
        </form>
      </div>

      <div>
        <header class="z-10 flex flex-row items-center gap-2 rounded-t border border-gray-300 bg-gray-50 p-2 px-4 py-2 text-sm">
          <MyButton
            tag={RouterLink}
            color="blue"
            to={{
              name: '//space/[space_id]/todo/table/add',
              params: {
                space_id: $route.params.space_id,
              },
            }}
          >
            <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
            <span class="capitalize">add todo</span>
          </MyButton>
          <MyButton
            type="button"
            color="green"
            disabled={loading.value || checkedList.value.length === 0}
            onClick={async () => {
              await $dialog.confirm.warn(`Do you really want to done checked data?`);

              loading.value = true;
              try {
                await trpc.todo.updateMany.mutate({
                  space_id: $route.params.space_id,
                  data: {
                    done_at: new Date(),
                  },
                  target_list: checkedList.value,
                });
                $toast.success('Todo have been done.');

                await handleSubmit();
              } finally {
                loading.value = false;
              }
            }}
          >
            <span class="icon-[material-symbols--check-circle-outline-rounded] h-4 w-4"></span>
            <span class="capitalize">done</span>
          </MyButton>
          <MyButton
            type="button"
            disabled={loading.value || checkedList.value.length === 0}
            onClick={async () => {
              const file_id_list = checkedList.value
                .flatMap((x) => x.file_list)
                .map((x) => x.file_id);
              if (file_id_list.length === 0) {
                return $dialog.alert.info('There are no files in the checked line.');
              }

              loading.value = true;
              try {
                await downloadManyFiles({ file_id_list });
              } finally {
                loading.value = false;
              }
            }}
          >
            <span class="icon-[simple-line-icons--cloud-download] h-4 w-4"></span>
            <span class="capitalize">download</span>
          </MyButton>
          <MyButton
            type="button"
            disabled={loading.value || checkedList.value.length === 0}
            onClick={async () => {
              await $dialog.confirm.warn(`Do you really want to delete checked data?`);

              loading.value = true;
              try {
                await trpc.todo.deleteMany.mutate({
                  space_id: $route.params.space_id,
                  target_list: checkedList.value,
                });
                $toast.success('Todo have been deleted.');

                await handleSubmit();
              } finally {
                loading.value = false;
              }
            }}
          >
            <span class="icon-[tabler--trash-filled] h-4 w-4"></span>
            <span class="capitalize">delete</span>
          </MyButton>
        </header>

        <table class="h-full w-full overflow-x-auto rounded-sm border border-gray-300 bg-gray-50 text-sm">
          <thead class="text-gray-900">
            <tr class="divide-x divide-gray-200">
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                No
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <label class="flex h-full justify-center hover:cursor-pointer">
                  <input
                    type="checkbox"
                    name="header-checkbox"
                    class="hover:cursor-pointer"
                    checked={headerCheckbox.value.checked}
                    indeterminate={headerCheckbox.value.indeterminate}
                    onClick={() => {
                      const checked = headerCheckbox.value.checked;
                      data.value.todo_list.forEach((x) => (x.checked = !checked));
                    }}
                  />
                </label>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  group
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="group"
                    onClick={() => changeSortOrder('group')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  title
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="title"
                    onClick={() => changeSortOrder('title')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  begin
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="begin_date"
                    onClick={() => changeSortOrder('begin_date')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  limit
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="limit_date"
                    onClick={() => changeSortOrder('limit_date')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  description
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="description"
                    onClick={() => changeSortOrder('description')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                files
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  done
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="done_at"
                    onClick={() => changeSortOrder('done_at')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  created
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="created_at"
                    onClick={() => changeSortOrder('created_at')}
                  ></MySortButton>
                </div>
              </th>
              <th
                scope="col"
                class={[
                  'sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
                ]}
              >
                <div class="flex items-center justify-center">
                  updated
                  <MySortButton
                    sort={modelValue.value.sort}
                    field="updated_at"
                    onClick={() => changeSortOrder('updated_at')}
                  ></MySortButton>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white text-gray-900">
            {data.value.todo_list.map((todo, i) => (
              <tr key={todo.todo_id} class="divide-x divide-gray-200">
                <td class="max-w-48">
                  <RouterLink
                    to={{
                      name: '//space/[space_id]/todo/table/[todo_id]',
                      params: {
                        space_id: $route.params.space_id,
                        todo_id: todo.todo_id,
                      },
                    }}
                    class="flex w-full justify-end px-2 py-1 text-blue-600 hover:underline"
                  >
                    #{i + 1}
                  </RouterLink>
                </td>
                <td class="max-w-48">
                  <label class="flex h-full justify-center hover:cursor-pointer">
                    <input
                      v-model={todo.checked}
                      name="row-checkbox"
                      type="checkbox"
                      class="hover:cursor-pointer"
                    />
                  </label>
                </td>
                <td class="max-w-48">
                  <div
                    class="line-clamp-1 flex min-w-28 items-center gap-0.5 px-2 py-1"
                    title={todo.group.group_name}
                  >
                    {todo.group.group_image ? (
                      <img
                        src={todo.group.group_image}
                        width="16"
                        height="16"
                        decoding="async"
                        class="h-4 w-4 rounded-sm object-cover object-center"
                      />
                    ) : (
                      <span class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                    )}
                    <span> {todo.group.group_name} </span>
                  </div>
                </td>
                <td class="max-w-48">
                  <div class="line-clamp-2 min-w-28 px-2 py-1" title={todo.title}>
                    {todo.title}
                  </div>
                </td>
                <td class="max-w-48">
                  <div class="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.begin_date} {todo.begin_time}
                  </div>
                </td>
                <td class="max-w-48">
                  <div class="line-clamp-1 min-w-28 px-2 py-1">
                    {todo.limit_date} {todo.limit_time}
                  </div>
                </td>
                <td class="max-w-48">
                  <div
                    class="line-clamp-4 min-w-28 px-2 py-1 wrap-break-word whitespace-pre-wrap"
                    title={todo.description}
                  >
                    {todo.description}
                  </div>
                </td>
                <td class="max-w-48">
                  <div
                    class="line-clamp-4 min-w-28 px-2 py-1 break-all"
                    title={todo.file_list.map((x) => x.filename).join(',')}
                  >
                    {todo.file_list.map((file) => (
                      <span key={file.file_id} class="mr-1 text-xs">
                        {file.filename}
                      </span>
                    ))}
                  </div>
                </td>
                <td class="max-w-48">
                  <div class="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.done_at ? dayjs(todo.done_at).format('YYYY-MM-DD') : ''}
                  </div>
                </td>
                <td class="max-w-48">
                  <div class="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.created_at
                      ? dayjs(todo.created_at).format('YYYY-MM-DD hh:mm:ss.SSS')
                      : ''}
                  </div>
                </td>
                <td class="max-w-48">
                  <div class="line-clamp-1 min-w-32 px-2 py-1">
                    {todo.updated_at
                      ? dayjs(todo.updated_at).format('YYYY-MM-DD hh:mm:ss.SSS')
                      : ''}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer class="sticky bottom-0 z-10 flex flex-row items-center gap-4 rounded-b border border-gray-300 bg-gray-50 px-4 py-2 text-sm">
          {/* https://www.delldesignsystem.com/components/pagination/ */}
          <div class="flex flex-row items-center gap-2">
            <span class="capitalize">items per page</span>
            <select
              v-model={modelValue.value.limit}
              name="limit"
              class="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
              disabled={loading.value}
              onChange={() => {
                modelValue.value.page = 1;
                return handleSubmit();
              }}
            >
              {[10, 50, 100, 200, 500].map((limit) => (
                <option key={limit} disabled={limit === modelValue.value.limit}>
                  {limit}
                </option>
              ))}
            </select>
          </div>

          <div class="flex flex-row items-center gap-2">
            <span class="min-w-4 text-right">
              {Math.min(data.value.total, modelValue.value.limit * (modelValue.value.page - 1) + 1)}
            </span>
            -
            <span class="min-w-4 text-right">
              {Math.min(data.value.total, modelValue.value.limit * modelValue.value.page)}
            </span>
            <span> of {data.value.total} items </span>
          </div>

          <div class="flex flex-row items-center gap-2">
            <div class="relative inline-block">
              <input
                v-model={modelValue.value.page}
                name="page"
                type="range"
                min="1"
                max={Math.ceil(data.value.total / modelValue.value.limit)}
                class="h-2 cursor-pointer rounded-lg bg-gray-200"
                disabled={loading.value}
                onChange={handleSubmit}
              />
              <span class="absolute end-0 -top-3 text-xs text-gray-500"> max </span>
              <span class="absolute end-0 -bottom-3 text-xs text-gray-500">
                {Math.ceil(data.value.total / modelValue.value.limit)}
              </span>
            </div>
            <input
              v-model={modelValue.value.page}
              name="page"
              type="number"
              min="1"
              max={Math.ceil(data.value.total / modelValue.value.limit)}
              step="1"
              class="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-gray-900"
              disabled={loading.value}
              onChange={handleSubmit}
            />
          </div>
        </footer>
      </div>
    </div>
  );
});
