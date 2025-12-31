<script setup lang="ts">
import type { TodoRouterSchema } from '@todo/express/schema';
import { type z } from '@todo/lib/zod';
import type { GroupSchema } from '@todo/prisma/schema';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc } from '~/lib/trpc';
import TodoForm, { type ModelValue } from '~/page/index/todo/table/component/TodoForm.vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';

export type ModalAddTodoResult = { todo: z.infer<typeof TodoRouterSchema.getOutput> };

const $toast = useToast();
const $dialog = useDialog();

const $emit = defineEmits<{
  done: [ModalAddTodoResult];
}>();

const { storedGroupList } = storeToRefs(useGroupStore());

const props = defineProps<{
  group_id?: number;
  begin_date: '' | `${number}-${number}-${number}`;
  begin_time: '' | `${number}:${number}`;
  limit_date: '' | `${number}-${number}-${number}`;
  limit_time: '' | `${number}:${number}`;
}>();

const modelValue = ref<ModelValue>({
  group_id: props.group_id ?? 0,
  title: '',
  description: '',
  begin_date: props.begin_date,
  begin_time: props.begin_time,
  limit_date: props.limit_date,
  limit_time: props.limit_time,
  order: 0,
  done_at: null,
});
const modelValueFileList = ref<DownloadFile[]>([]);
const modelValueGroup = ref<z.infer<typeof GroupSchema> | undefined>(
  storedGroupList.value.find((x) => x.group_id === props.group_id),
);

async function handleSubmit(value: ModelValue) {
  const loading = $dialog.loading();
  try {
    const todo = await trpc.todo.create.mutate(value);

    $toast.success('Todo has been saved.');

    $emit('done', { todo });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">add todo</header>
    <TodoForm
      v-model="modelValue"
      v-model:file_list="modelValueFileList"
      v-model:group="modelValueGroup"
      @submit="handleSubmit"
    >
    </TodoForm>
  </div>
</template>
