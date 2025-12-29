<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import SpaceForm, { type ModelValue } from '~/page/index/todo/component/SpaceForm.vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

export type ModalAddSpaceResult = { space: RouterOutput['space']['create'] };

const $emit = defineEmits<{
  done: [ModalAddSpaceResult];
}>();

const { storedSpaceList } = storeToRefs(useSpaceStore());

const modelValue = ref<ModelValue>({
  space_name: '',
  space_description: '',
  space_image: '',
  space_color: '#FFFFFF',
});

const $toast = useToast();
const $dialog = useDialog();

async function handleSubmit(input: ModelValue) {
  const loading = $dialog.loading();
  try {
    const space = await trpc.space.create.mutate(input);

    storedSpaceList.value.push(space);

    $toast.success('Data has been saved.');

    $emit('done', { space });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">create new space</header>
    <SpaceForm v-model="modelValue" @submit="handleSubmit"> </SpaceForm>
  </div>
</template>
