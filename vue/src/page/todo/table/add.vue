<script setup lang="ts">
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc } from '~/lib/trpc';
import { useLoading } from '~/plugin/LoadingPlugin';
import TodoForm, { type ModelValue } from './component/TodoForm.vue';

const router = useRouter();

const modelValue = ref<ModelValue>({
  space_id: 0,
  title: '',
  description: '',
  begin_date: '',
  begin_time: '',
  limit_date: '',
  limit_time: '',
  order: 0,
  done_at: null,
  tag_list: [],
});
const modelValueFileList = ref<DownloadFile[]>([]);

const $loading = useLoading();
async function handleSubmit(value: ModelValue) {
  const loading = $loading.open();
  try {
    await trpc.todo.create.mutate(value);

    router.push('/todo/table');
  } finally {
    loading.close();
  }
}
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
                class="inline-flex items-center text-sm font-medium text-gray-400 hover:text-blue-600"
              >
                <span class="icon-[fontisto--table-2] h-3 w-3 transition duration-75"> </span>
                <span class="ms-1 capitalize">table</span>
              </RouterLink>
            </li>
            <li class="inline-flex items-center">
              <span class="icon-[weui--arrow-filled]"></span>
            </li>
            <li class="inline-flex items-center">
              <RouterLink
                :to="{ name: '/todo/table/add' }"
                class="inline-flex items-center text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                <span class="ms-1 capitalize">add todo</span>
              </RouterLink>
            </li>
          </ol>
        </nav>

        <div class="flex items-center gap-1 text-lg font-bold">
          <span class="icon-[icon-park-solid--add-one] h-5 w-5"></span>
          <span class="capitalize">add todo</span>
        </div>
      </div>
    </div>

    <TodoForm
      v-model="modelValue"
      v-model:file_list="modelValueFileList"
      class="px-4"
      @submit="handleSubmit"
    >
    </TodoForm>
  </div>
</template>
