<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import SpaceForm, { type ModelValue } from '~/page/index/todo/component/SpaceForm.vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

export type ModalEditSpaceResult =
  | { event: 'update'; space: RouterOutput['space']['update'] }
  | { event: 'delete'; space: RouterOutput['space']['delete'] };

const $toast = useToast();
const $dialog = useDialog();

const $emit = defineEmits<{
  done: [ModalEditSpaceResult];
}>();

const { storedSpaceList } = storeToRefs(useSpaceStore());

const props = defineProps<{
  space_id: number;
}>();

const space = await trpc.space.get.query({ space_id: props.space_id });

const modelValue = ref<ModelValue>(space);
const updated_at = space.updated_at;

async function handleSubmit(input: ModelValue) {
  const loading = $dialog.loading();
  try {
    const space = await trpc.space.update.mutate({
      ...input,
      space_id: props.space_id,
      updated_at,
    });

    storedSpaceList.value = storedSpaceList.value.map((origin) =>
      origin.space_id === space.space_id ? { ...origin, ...space } : origin,
    );

    $toast.success('Data has been saved.');

    $emit('done', { event: 'update', space });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="rounded-lg bg-linear-to-b from-white to-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">edit space</header>
    <SpaceForm v-model="modelValue" @submit="handleSubmit">
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
                const space = await trpc.space.delete.mutate({ space_id, updated_at });

                storedSpaceList = storedSpaceList.filter((origin) => {
                  return origin.space_id !== space.space_id;
                });

                $toast.success('Data has been deleted.');

                $emit('done', { event: 'delete', space });
              } finally {
                loading.close();
              }
            }
          "
        >
          <span class="capitalize">delete</span>
        </MyButton>
      </template>
    </SpaceForm>
  </div>
</template>
