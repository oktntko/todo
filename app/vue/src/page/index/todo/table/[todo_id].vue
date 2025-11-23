<script setup lang="ts">
import type { z } from '@todo/lib/zod';
import type { SpaceSchema } from '@todo/prisma/schema';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc } from '~/lib/trpc';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import TodoForm, { type ModelValue } from './component/TodoForm.vue';

const router = useRouter();
const route = useRoute('//todo/table/[todo_id]');
const todo_id = route.params.todo_id;

const modelValue = ref<ModelValue>();
const modelValueFileList = ref<DownloadFile[]>([]);
const modelValueSpace = ref<z.infer<typeof SpaceSchema>>();
let updated_at = new Date();

onMounted(async () => {
  const todo = await trpc.todo.get.query({ todo_id });

  modelValue.value = todo;
  modelValueFileList.value = todo.file_list;
  modelValueSpace.value = todo.space;
  updated_at = todo.updated_at;
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(value: ModelValue) {
  const loading = $loading.open();
  try {
    await trpc.todo.update.mutate({ ...value, todo_id, updated_at });

    $toast.success('Todo has been saved.');

    router.push({ name: '//todo/table/' });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="mb-8 flex flex-col gap-4 px-4">
    <div>
      <nav aria-label="Breadcrumb">
        <MyBreadcrumb class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <RouterLink
            :to="{
              name: '//todo/table/',
            }"
            class="inline-flex items-center text-sm font-medium text-gray-400 hover:text-blue-600"
          >
            <span class="icon-[fontisto--table-2] h-3 w-3 transition duration-75"> </span>
            <span class="ms-1 capitalize">table</span>
          </RouterLink>
          <RouterLink
            :to="{
              name: '//todo/table/[todo_id]',
              params: {
                todo_id,
              },
            }"
            class="inline-flex items-center text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            <span class="ms-1 capitalize">edit todo</span>
          </RouterLink>
        </MyBreadcrumb>
      </nav>
    </div>

    <div>
      <Transition
        mode="out-in"
        enter-from-class="transform opacity-0"
        enter-active-class="transition ease-out duration-200"
        enter-to-class="transform opacity-100"
      >
        <TodoForm
          v-if="modelValue"
          v-model="modelValue"
          v-model:file_list="modelValueFileList"
          v-model:space="modelValueSpace"
          :todo_id="todo_id"
          @submit="handleSubmit"
        >
          <template #buttons>
            <button
              type="button"
              :class="[
                'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
                'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
                'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
                'border-yellow-500 bg-white text-yellow-800 hover:bg-yellow-500 hover:text-gray-800',
                'capitalize',
              ]"
              @click="
                async () => {
                  const yes = await $dialog.confirm(`Do you really want to delete this data?`);
                  if (!yes) {
                    return;
                  }
                  const loading = $loading.open();
                  try {
                    await trpc.todo.delete.mutate({ todo_id });

                    $toast.success('Todo have been deleted.');

                    router.replace({
                      name: '//todo/table/',
                    });
                  } finally {
                    loading.close();
                  }
                }
              "
            >
              delete
            </button>
          </template>
        </TodoForm>

        <MyLoading v-else> </MyLoading>
      </Transition>
    </div>
  </div>
</template>
