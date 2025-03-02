<script setup lang="ts">
import { useFile } from '~/composable/useFile';
import { useValidate } from '~/composable/useValidate';
import { dayjs } from '~/lib/dayjs';
import { trpc, type RouterOutput } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import MyTag from '~/page/component/MyTag.vue';
import { TodoStatusList } from '~/schema/option/OptionTodoStatus';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

definePage({
  alias: ['/todo/'],
});

const { downloadManyFiles } = useFile();

const modelValue = ref<z.infer<typeof TodoRouterSchema.searchInput>>({
  where: {
    space_id: null,
    todo_keyword: '',
    todo_status: ['active'],
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
  todo_list: (RouterOutput['todo']['get'] & { checked?: boolean })[];
}>({
  total: 0,
  todo_list: [],
});

const loading = ref(true);

const { validateSubmit, ErrorMessage } = useValidate(TodoRouterSchema.searchInput, modelValue);
const handleSubmit = validateSubmit(async () => {
  loading.value = true;
  try {
    data.value = await trpc.todo.search.query(modelValue.value);
  } finally {
    loading.value = false;
  }
});

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
</script>

<template>
  <div class="mb-8 flex flex-col gap-6 px-4">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li class="inline-flex items-center">
              <RouterLink
                :to="{ name: '/todo/table/' }"
                class="inline-flex items-center text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                <span class="icon-[fontisto--table-2] h-3 w-3 transition duration-75"> </span>
                <span class="ms-1 capitalize">table</span>
              </RouterLink>
            </li>
          </ol>
        </nav>

        <div class="flex items-center gap-1 text-lg font-bold">
          <span class="icon-[fontisto--table-2] h-5 w-5"></span>
          <span class="capitalize">search todo</span>
        </div>
      </div>
    </div>

    <form class="flex flex-col gap-4 px-4" autocomplete="off" @submit.prevent="handleSubmit">
      <section class="flex flex-col gap-2">
        <div class="focus-container flex flex-col gap-1">
          <label for="where.todo_keyword" class="optional text-sm capitalize"> keyword </label>
          <input
            id="where.todo_keyword"
            v-model.lazy="modelValue.where.todo_keyword"
            class="block rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            maxlength="100"
          />

          <ErrorMessage class="text-xs text-red-600" for="where.todo_keyword" />
        </div>

        <div class="flex flex-col gap-1">
          <span class="optional text-sm capitalize"> status </span>
          <div class="focus-container flex flex-col gap-1 sm:flex-row sm:gap-2">
            <label
              v-for="todo_status of TodoStatusList"
              :key="todo_status"
              :for="`status-${todo_status}`"
              class="flex items-center font-medium text-gray-900 capitalize"
            >
              <input
                :id="`status-${todo_status}`"
                v-model="modelValue.where.todo_status"
                type="checkbox"
                :value="todo_status"
                class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
              />
              {{ todo_status }}
            </label>

            <ErrorMessage class="text-xs text-red-600" for="where.todo_status" />
          </div>
        </div>
      </section>

      <section class="flex gap-2">
        <button
          type="submit"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-green-700 bg-green-600 text-white hover:bg-green-800',
            'capitalize',
          ]"
          :disabled="loading"
        >
          <span class="icon-[bx--search] h-4 w-4"></span>
          <span class="ms-1 capitalize">search</span>
        </button>
      </section>
    </form>

    <div class="">
      <header
        class="z-10 flex flex-row items-center gap-2 rounded-t border border-gray-300 bg-gray-50 p-2 px-4 py-2 text-sm"
      >
        <RouterLink
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-blue-700 bg-white text-blue-700 hover:bg-blue-800 hover:text-white',
            'capitalize',
          ]"
          :to="{ name: '/todo/table/add' }"
        >
          <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
          <span class="ms-1 capitalize">add todo</span>
        </RouterLink>
        <button
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-green-700 bg-white text-green-700 hover:bg-green-800 hover:text-white',
            'capitalize',
          ]"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              const yes = await $dialog.confirm(`Do you really want to done checked data?`);
              if (!yes) {
                return;
              }

              loading = true;
              try {
                await trpc.todo.updateMany.mutate({
                  done_at: new Date(),
                  list: checkedList,
                });
                $toast.success('Todo have been done.');

                await handleSubmit();
              } finally {
                loading = false;
              }
            }
          "
        >
          <span class="icon-[material-symbols--check-circle-outline-rounded] h-4 w-4"></span>
          <span class="ms-1 capitalize">done</span>
        </button>
        <button
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-gray-300 bg-white text-gray-800 hover:bg-gray-200',
            'capitalize',
          ]"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              const file_id_list = checkedList.flatMap((x) => x.file_list).map((x) => x.file_id);
              if (file_id_list.length === 0) {
                $dialog.alert('There are no files in the checked line.');
                return;
              }

              loading = true;
              try {
                await downloadManyFiles({ file_id_list });
              } finally {
                loading = false;
              }
            }
          "
        >
          <span class="icon-[simple-line-icons--cloud-download] h-4 w-4"></span>
          <span class="ms-1 capitalize">download</span>
        </button>
        <button
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-gray-300 bg-white text-gray-800 hover:bg-gray-200',
            'capitalize',
          ]"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              const yes = await $dialog.confirm(`Do you really want to delete checked data?`);
              if (!yes) {
                return;
              }

              loading = true;
              try {
                await trpc.todo.deleteMany.mutate(checkedList);
                $toast.success('Todo have been deleted.');

                await handleSubmit();
              } finally {
                loading = false;
              }
            }
          "
        >
          <span class="icon-[tabler--trash-filled] h-4 w-4"></span>
          <span class="ms-1 capitalize">delete</span>
        </button>
      </header>

      <table
        class="h-full w-full overflow-x-auto rounded-sm border border-gray-300 bg-gray-50 text-sm"
      >
        <thead class="text-gray-900">
          <tr class="divide-x divide-gray-200">
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              No
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <label class="flex h-full justify-center hover:cursor-pointer">
                <input
                  type="checkbox"
                  class="hover:cursor-pointer"
                  :checked="headerCheckbox.checked"
                  :indeterminate="headerCheckbox.indeterminate"
                  @click="
                    () => {
                      const checked = headerCheckbox.checked;
                      data.todo_list.forEach((x) => (x.checked = !checked));
                    }
                  "
                />
              </label>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                space
                <MySortButton
                  :sort="modelValue.sort"
                  field="space"
                  @click="changeSortOrder('space')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                title
                <MySortButton
                  :sort="modelValue.sort"
                  field="title"
                  @click="changeSortOrder('title')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                begin
                <MySortButton
                  :sort="modelValue.sort"
                  field="begin_date"
                  @click="changeSortOrder('begin_date')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                limit
                <MySortButton
                  :sort="modelValue.sort"
                  field="limit_date"
                  @click="changeSortOrder('limit_date')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                description
                <MySortButton
                  :sort="modelValue.sort"
                  field="description"
                  @click="changeSortOrder('description')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              tags
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              files
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                done
                <MySortButton
                  :sort="modelValue.sort"
                  field="done_at"
                  @click="changeSortOrder('done_at')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                created
                <MySortButton
                  :sort="modelValue.sort"
                  field="created_at"
                  @click="changeSortOrder('created_at')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                updated
                <MySortButton
                  :sort="modelValue.sort"
                  field="updated_at"
                  @click="changeSortOrder('updated_at')"
                ></MySortButton>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white text-gray-900">
          <tr
            v-for="(todo, i) of data.todo_list"
            :key="todo.todo_id"
            class="divide-x divide-gray-200"
          >
            <td class="max-w-48">
              <RouterLink
                :to="{
                  name: '/todo/table/[todo_id]',
                  params: { todo_id: todo.todo_id },
                }"
                class="flex w-full justify-end px-2 py-1 text-blue-600 hover:underline"
              >
                #{{ i + 1 }}
              </RouterLink>
            </td>
            <td class="max-w-48">
              <label class="flex h-full justify-center hover:cursor-pointer">
                <input v-model="todo.checked" type="checkbox" class="hover:cursor-pointer" />
              </label>
            </td>
            <td class="max-w-48">
              <div
                class="line-clamp-1 flex min-w-28 items-center gap-0.5 px-2 py-1"
                :title="todo.space.space_name"
              >
                <img
                  v-if="todo.space.space_image"
                  :src="todo.space.space_image"
                  width="16"
                  height="16"
                  decoding="async"
                  class="h-4 w-4 rounded-sm object-cover object-center"
                />
                <span v-else class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                <span> {{ todo.space.space_name }} </span>
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-2 min-w-28 px-2 py-1" :title="todo.title">
                {{ todo.title }}
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{ todo.begin_date }} {{ todo.begin_time }}
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-28 px-2 py-1">
                {{ todo.limit_date }} {{ todo.limit_time }}
              </div>
            </td>
            <td class="max-w-48">
              <div
                class="line-clamp-4 min-w-28 px-2 py-1 break-words whitespace-pre-wrap"
                :title="todo.description"
              >
                {{ todo.description }}
              </div>
            </td>
            <td class="max-w-48">
              <div
                class="line-clamp-4 min-w-28 px-2 py-1"
                :title="todo.tag_list.map((x) => x.tag_name).join(',')"
              >
                <MyTag v-for="tag of todo.tag_list" :key="tag.tag_id" :tag="tag"> </MyTag>
              </div>
            </td>
            <td class="max-w-48">
              <div
                class="line-clamp-4 min-w-28 px-2 py-1 break-all"
                :title="todo.file_list.map((x) => x.filename).join(',')"
              >
                <span v-for="file of todo.file_list" :key="file.file_id" class="mr-1 text-xs">
                  {{ file.filename }}
                </span>
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{ todo.done_at ? dayjs(todo.done_at).format('YYYY-MM-DD') : '' }}
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{
                  todo.created_at ? dayjs(todo.created_at).format('YYYY-MM-DD hh:mm:ss.SSS') : ''
                }}
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{
                  todo.updated_at ? dayjs(todo.updated_at).format('YYYY-MM-DD hh:mm:ss.SSS') : ''
                }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <footer
        class="sticky bottom-0 z-10 flex flex-row items-center gap-4 rounded-b border border-gray-300 bg-gray-50 px-4 py-2 text-sm"
      >
        <!-- https://www.delldesignsystem.com/components/pagination/ -->
        <div class="flex flex-row items-center gap-2">
          <span class="capitalize">items per page</span>
          <select
            v-model.number="modelValue.limit"
            class="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
            :disabled="loading"
            @change="
              () => {
                modelValue.page = 1;
                return handleSubmit();
              }
            "
          >
            <option
              v-for="limit of [10, 50, 100, 200, 500]"
              :key="limit"
              :disabled="limit === modelValue.limit"
            >
              {{ limit }}
            </option>
          </select>
        </div>

        <div class="flex flex-row items-center gap-2">
          <span class="min-w-4 text-right">
            {{ Math.min(data.total, modelValue.limit * (modelValue.page - 1) + 1) }}
          </span>
          -
          <span class="min-w-4 text-right">
            {{ Math.min(data.total, modelValue.limit * modelValue.page) }}
          </span>
          <span> of {{ data.total }} items </span>
        </div>

        <div class="flex flex-row items-center gap-2">
          <div class="relative inline-block">
            <input
              v-model.number="modelValue.page"
              type="range"
              min="1"
              :max="Math.ceil(data.total / modelValue.limit)"
              class="h-2 cursor-pointer rounded-lg bg-gray-200"
              :disabled="loading"
              @change="handleSubmit"
            />
            <span class="absolute end-0 -top-3 text-xs text-gray-500"> max </span>
            <span class="absolute end-0 -bottom-3 text-xs text-gray-500">
              {{ Math.ceil(data.total / modelValue.limit) }}
            </span>
          </div>
          <input
            v-model.number="modelValue.page"
            type="number"
            min="1"
            :max="Math.ceil(data.total / modelValue.limit)"
            step="1"
            class="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-gray-900"
            :disabled="loading"
            @change="handleSubmit"
          />
        </div>
      </footer>
    </div>
  </div>
</template>
