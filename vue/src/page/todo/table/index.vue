<script setup lang="ts">
import dayjs from 'dayjs';
import { useValidate } from '~/composable/useValidate';
import { trpc, type RouterOutput } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import MyTag from '~/page/component/MyTag.vue';
import { TodoStatusList } from '~/schema/option/OptionTodoStatus';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

const modelValue = ref<z.infer<typeof TodoRouterSchema.listInput>>({
  where: {
    space_id: null,
    todo_keyword: '',
    todo_status: ['active'],
  },
  sort: {
    field: 'order',
    order: 'asc',
  },
});

const data = ref<RouterOutput['todo']['list']>({
  total: 0,
  todo_list: [],
});

const pager = ref({
  currentPage: 1,
  pageSize: 50,
});

const loading = ref(true);

const { validateSubmit, ErrorMessage } = useValidate(TodoRouterSchema.listInput, modelValue);
const handleSubmit = validateSubmit(async () => {
  loading.value = true;
  try {
    data.value = await trpc.todo.list.query(modelValue.value);
  } finally {
    loading.value = false;
  }
});

onMounted(() => {
  handleSubmit();
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
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <span class="icon-[fontisto--table-2] h-3 w-3 transition duration-75"> </span>
                <span class="ms-1 capitalize">table</span>
              </RouterLink>
            </li>
          </ol>
        </nav>

        <div class="flex items-center text-lg font-bold">
          <span class="icon-[bx--search] h-6 w-6"></span>
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
              class="flex items-center font-medium capitalize text-gray-900"
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
          :class="['button button-text button-green', 'capitalize']"
          :disabled="loading"
        >
          search
        </button>
      </section>
    </form>

    <div class="">
      <header
        class="z-10 flex flex-row items-center gap-2 rounded-t border border-gray-300 bg-gray-50 p-2 px-4 py-2 text-sm"
      >
        <RouterLink
          :class="['button button-text button-blue secondary', 'capitalize']"
          :to="{
            name: '/todo/table/add',
          }"
        >
          <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
          <span class="ms-1 capitalize">add todo</span>
        </RouterLink>
      </header>

      <table class="w-full overflow-x-auto rounded border border-gray-300 bg-gray-50">
        <thead class="text-gray-900">
          <tr class="divide-x divide-gray-200">
            <th scope="col" class="column">No</th>
            <th scope="col" class="column">
              <label> <input type="checkbox" /></label>
            </th>
            <th scope="col" class="column">title</th>
            <th scope="col" class="column">begin</th>
            <th scope="col" class="column">limit</th>
            <th scope="col" class="column">description</th>
            <th scope="col" class="column">tags</th>
            <th scope="col" class="column">files</th>
            <th scope="col" class="column">done</th>
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
                  params: {
                    todo_id: todo.todo_id,
                  },
                }"
                class="group flex justify-end px-2 py-1 text-blue-600 transition duration-75 hover:underline"
              >
                #{{ i + 1 }}
              </RouterLink>
            </td>
            <td class="max-w-48">
              <label class="flex justify-center px-2 py-1 hover:cursor-pointer">
                <input type="checkbox" class="hover:cursor-pointer"
              /></label>
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
                class="line-clamp-4 min-w-28 whitespace-pre-wrap break-words px-2 py-1"
                :title="todo.description"
              >
                {{ todo.description }}
              </div>
            </td>
            <td class="max-w-48">
              <div
                class="line-clamp-1 min-w-28 px-2 py-1"
                :title="todo.tag_list.map((x) => x.tag_name).join(',')"
              >
                <MyTag v-for="tag of todo.tag_list" :key="tag.tag_id" :tag="tag">
                  {{ tag.tag_name }}
                </MyTag>
              </div>
            </td>
            <td class="max-w-48">
              <MyDownloadFileList
                class="flex min-w-32 flex-col px-2 py-1"
                :file_list="todo.file_list"
                @deleted="
                  (deletedIndex) => {
                    todo.file_list = todo.file_list.filter((_, i) => i !== deletedIndex);
                  }
                "
              ></MyDownloadFileList>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{ todo.done_at ? dayjs(todo.done_at).format('YYYY-MM-DD') : '' }}
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
            v-model="pager.pageSize"
            class="inline-block rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
            :disabled="loading"
            @change="
              () => {
                pager.currentPage = 1;
                return handleSubmit();
              }
            "
          >
            <option
              v-for="pageSize of [50, 100, 200, 500]"
              :key="pageSize"
              :disabled="pageSize === pager.currentPage"
            >
              {{ pageSize }}
            </option>
          </select>
        </div>

        <div class="flex flex-row items-center gap-2">
          <span class="min-w-4 text-right">
            {{ Math.min(data.total, pager.pageSize * (pager.currentPage - 1) + 1) }}
          </span>
          -
          <span class="min-w-4 text-right">
            {{ Math.min(data.total, pager.pageSize * pager.currentPage) }}
          </span>
          <span> of {{ data.total }} items </span>
        </div>

        <div class="flex flex-row items-center gap-2">
          <div class="relative inline-block">
            <input
              v-model.number="pager.currentPage"
              type="range"
              min="1"
              :max="Math.ceil(data.total / pager.pageSize)"
              class="h-2 cursor-pointer rounded-lg bg-gray-200"
              :disabled="loading"
              @input="handleSubmit"
            />
            <span class="absolute -top-3 end-0 text-xs text-gray-500"> max </span>
            <span class="absolute -bottom-3 end-0 text-xs text-gray-500">
              {{ Math.ceil(data.total / pager.pageSize) }}
            </span>
          </div>
          <input
            v-model.number="pager.currentPage"
            type="number"
            min="1"
            :max="Math.ceil(data.total / pager.pageSize)"
            step="1"
            class="inline-block rounded border border-gray-300 bg-white px-2 py-1 text-gray-900"
            :disabled="loading"
            @input="handleSubmit"
          />
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="postcss">
.column {
  @apply sticky top-0 z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize;
}
</style>
