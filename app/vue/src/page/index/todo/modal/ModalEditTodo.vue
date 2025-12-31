<script setup lang="ts">
import { R } from '@todo/lib/remeda';
import type { z } from '@todo/lib/zod';
import type { GroupSchema } from '@todo/prisma/schema';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc, type RouterOutput } from '~/lib/trpc';
import TodoForm, { type ModelValue } from '~/page/index/todo/table/component/TodoForm.vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export type ModalEditTodoResult =
  | { event: 'update'; todo: RouterOutput['todo']['update'] }
  | { event: 'delete'; todo: RouterOutput['todo']['delete'] };

const $emit = defineEmits<{
  done: [ModalEditTodoResult];
}>();

const $toast = useToast();
const $dialog = useDialog();

const props = defineProps<{
  todo_id: string;
}>();

const todo = await trpc.todo.get.query({ todo_id: props.todo_id });

const modelValue = ref<ModelValue>(R.omit(todo, ['file_list', 'group']));
const modelValueFileList = ref<DownloadFile[]>(todo.file_list);
const modelValueGroup = ref<z.infer<typeof GroupSchema>>(todo.group);
const updated_at = todo.updated_at;

async function handleSubmit(input: ModelValue) {
  const loading = $dialog.loading();
  try {
    const todo = await trpc.todo.update.mutate({
      ...input,
      todo_id: props.todo_id,
      updated_at,
    });

    $toast.success('Todo has been saved.');

    $emit('done', { event: 'update', todo });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">edit todo</header>
    <TodoForm
      v-model="modelValue"
      v-model:file_list="modelValueFileList"
      v-model:group="modelValueGroup"
      :todo_id="todo_id"
      @submit="handleSubmit"
    >
      <template #buttons>
        <MyButton
          type="button"
          color="yellow"
          variant="outlined"
          @click="
            async () => {
              await $dialog.confirm.warn(`Do you really want to delete this data?`);

              const loading = $dialog.loading();
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
          <span class="capitalize">delete</span>
        </MyButton>
      </template>
    </TodoForm>
  </div>
</template>
