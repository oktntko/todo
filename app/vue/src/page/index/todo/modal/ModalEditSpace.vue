<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import SpaceForm, { type ModelValue } from '~/page/index/todo/component/SpaceForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

export type ModalEditSpaceResult =
  | { event: 'update'; space: RouterOutput['space']['update'] }
  | { event: 'delete'; space: RouterOutput['space']['delete'] };

const $emit = defineEmits<{
  done: [ModalEditSpaceResult];
  close: [];
}>();

const { storedSpaceList } = storeToRefs(useSpaceStore());

const props = defineProps<{
  space_id: number;
}>();

const modelValue = ref<ModelValue>();
let updated_at = new Date();

onMounted(async () => {
  const space = await trpc.space.get.query({ space_id: props.space_id });
  modelValue.value = space;
  updated_at = space.updated_at;
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
  try {
    const space = await trpc.space.update.mutate({
      ...input,
      space_id: props.space_id,
      updated_at,
    });

    storedSpaceList.value = storedSpaceList.value.map((origin) =>
      origin.space_id === space.space_id ? { ...origin, ...space } : origin,
    );

    $emit('done', { event: 'update', space });

    $toast.success('Data has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <PluginModal @close="$emit('close')">
    <div class="p-4">
      <header class="mb-4 text-lg font-bold capitalize">edit space</header>
      <Transition
        mode="out-in"
        enter-from-class="transform opacity-0"
        enter-active-class="transition ease-out duration-200"
        enter-to-class="transform opacity-100"
      >
        <SpaceForm v-if="modelValue" v-model="modelValue" class="px-4" @submit="handleSubmit">
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
              delete
            </button>
          </template>
        </SpaceForm>
        <MyLoading v-else class="flex grow flex-col gap-8"> </MyLoading>
      </Transition>
    </div>
  </PluginModal>
</template>
