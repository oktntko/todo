<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import WhiteboardSpaceForm, {
  type ModelValue,
} from '~/page/index/todo/component/WhiteboardSpaceForm.vue';
import { useModal } from '~/plugin/ModalPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export type ModalEditWhiteboardResult =
  | { event: 'update'; whiteboard: RouterOutput['whiteboard']['update'] }
  | { event: 'delete'; whiteboard: RouterOutput['whiteboard']['delete'] };

const $toast = useToast();
const $modal = useModal();

const $emit = defineEmits<{
  done: [ModalEditWhiteboardResult];
}>();

const props = defineProps<{
  whiteboard_id: number;
}>();

const whiteboard = await trpc.whiteboard.get.query({ whiteboard_id: props.whiteboard_id });

const modelValue = ref<ModelValue>(whiteboard);
const updated_at = whiteboard.updated_at;

async function handleSubmit(input: ModelValue) {
  const loading = $modal.loading();
  try {
    const whiteboard = await trpc.whiteboard.update.mutate({
      ...input,
      whiteboard_id: props.whiteboard_id,
      updated_at,
    });

    $toast.success('Data has been saved.');

    $emit('done', { event: 'update', whiteboard });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="rounded-lg bg-linear-to-b from-white to-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">edit whiteboard</header>
    <WhiteboardSpaceForm v-model="modelValue" @submit="handleSubmit">
      <template #buttons>
        <MyButton
          type="button"
          color="yellow"
          variant="outlined"
          @click="
            async () => {
              await $modal.confirm.warn(`Do you really want to delete this data?`);

              const loading = $modal.loading();
              try {
                const whiteboard = await trpc.whiteboard.delete.mutate({
                  whiteboard_id,
                  updated_at,
                });

                $emit('done', { event: 'delete', whiteboard });
              } finally {
                loading.close();
              }
            }
          "
        >
          <span class="capitalize">delete</span>
        </MyButton>
      </template>
    </WhiteboardSpaceForm>
  </div>
</template>
