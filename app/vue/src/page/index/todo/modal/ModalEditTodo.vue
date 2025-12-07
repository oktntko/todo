<script setup lang="ts">
import type { z } from '@todo/lib/zod';
import type { SpaceSchema } from '@todo/prisma/schema';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc, type RouterOutput } from '~/lib/trpc';
import TodoForm, { type ModelValue } from '~/page/index/todo/table/component/TodoForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export type ModalEditTodoResult =
  | { event: 'update'; todo: RouterOutput['todo']['update'] }
  | { event: 'delete'; todo: RouterOutput['todo']['delete'] };

const $emit = defineEmits<{
  done: [ModalEditTodoResult];
  close: [];
}>();

const props = defineProps<{
  todo_id: string;
}>();

const modelValue = ref<ModelValue>();
const modelValueFileList = ref<DownloadFile[]>([]);
const modelValueSpace = ref<z.infer<typeof SpaceSchema>>();
let updated_at = new Date();

onMounted(async () => {
  const todo = await trpc.todo.get.query({ todo_id: props.todo_id });

  modelValue.value = todo;
  modelValueFileList.value = todo.file_list;
  modelValueSpace.value = todo.space;
  updated_at = todo.updated_at;
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
  try {
    const todo = await trpc.todo.update.mutate({
      ...input,
      todo_id: props.todo_id,
      updated_at,
    });

    $emit('done', { event: 'update', todo });

    $toast.success('Todo has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <PluginModal @close="$emit('close')">
    <div class="p-4">
      <header class="mb-4 text-lg font-bold capitalize">edit todo</header>
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
          class="px-4"
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
                    const todo = await trpc.todo.delete.mutate({ todo_id });

                    $toast.success('Todo have been deleted.');

                    $emit('done', { event: 'delete', todo });
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
        <MyLoading v-else class="flex grow flex-col gap-8"> </MyLoading>
      </Transition>
    </div>
  </PluginModal>
</template>
