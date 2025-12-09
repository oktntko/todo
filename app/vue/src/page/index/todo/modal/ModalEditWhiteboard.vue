<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import WhiteboardSpaceForm, {
  type ModelValue,
} from '~/page/index/todo/component/WhiteboardSpaceForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export type ModalEditWhiteboardResult =
  | { event: 'update'; whiteboard: RouterOutput['whiteboard']['update'] }
  | { event: 'delete'; whiteboard: RouterOutput['whiteboard']['delete'] };

const $toast = useToast();
const $loading = useLoading();

const $emit = defineEmits<{
  done: [ModalEditWhiteboardResult];
  close: [];
}>();

const props = defineProps<{
  whiteboard_id: number;
}>();

const whiteboard = await trpc.whiteboard.get.query({ whiteboard_id: props.whiteboard_id });

const modelValue = ref<ModelValue>(whiteboard);
const updated_at = whiteboard.updated_at;

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
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
  <PluginModal class="p-8" @close="$emit('close')">
    <header class="mb-4 text-lg font-bold capitalize">edit whiteboard</header>
    <WhiteboardSpaceForm v-model="modelValue" @submit="handleSubmit">
      <template #buttons>
        <MyButton
          type="button"
          color="yellow"
          variant="outlined"
          @click="
            async () => {
              const yes = await $dialog.confirm(`Do you really want to delete this data?`);
              if (!yes) {
                return;
              }
              const loading = $loading.open();
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
  </PluginModal>
</template>
