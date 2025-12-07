<script setup lang="ts">
import type { TodoOutputSchema } from '@todo/express/schema';
import { type z } from '@todo/lib/zod';
import type { SpaceSchema } from '@todo/prisma/schema';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc } from '~/lib/trpc';
import TodoForm, { type ModelValue } from '~/page/index/todo/table/component/TodoForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

export type ModalAddTodoResult = { todo: z.infer<typeof TodoOutputSchema> };

const $emit = defineEmits<{
  done: [ModalAddTodoResult];
  close: [];
}>();

const { storedSpaceList } = storeToRefs(useSpaceStore());

const props = defineProps<{
  space_id?: number;
  begin_date: '' | `${number}-${number}-${number}`;
  begin_time: '' | `${number}:${number}`;
  limit_date: '' | `${number}-${number}-${number}`;
  limit_time: '' | `${number}:${number}`;
}>();

const modelValue = ref<ModelValue>({
  space_id: props.space_id ?? 0,
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
const modelValueSpace = ref<z.infer<typeof SpaceSchema> | undefined>(
  storedSpaceList.value.find((x) => x.space_id === props.space_id),
);

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(value: ModelValue) {
  const loading = $loading.open();
  try {
    const todo = await trpc.todo.create.mutate(value);

    $emit('done', { todo });

    $toast.success('Todo has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <PluginModal @close="$emit('close')">
    <div class="p-4">
      <header class="mb-4 text-lg font-bold capitalize">add todo</header>
      <TodoForm
        v-model="modelValue"
        v-model:file_list="modelValueFileList"
        v-model:space="modelValueSpace"
        class="px-4"
        @submit="handleSubmit"
      >
      </TodoForm>
    </div>
  </PluginModal>
</template>
