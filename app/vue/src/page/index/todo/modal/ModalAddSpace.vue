<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import SpaceForm, { type ModelValue } from '~/page/index/todo/component/SpaceForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

const emit = defineEmits<{
  close: [RouterOutput['space']['create']];
}>();

const { storedSpaceList } = storeToRefs(useSpaceStore());

const modelValue = ref<ModelValue>({
  space_name: '',
  space_description: '',
  space_image: '',
  space_color: '#FFFFFF',
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
  try {
    const space = await trpc.space.create.mutate(input);

    storedSpaceList.value.push(space);

    emit('close', space);

    $toast.success('Data has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="p-4">
    <header class="mb-4 text-lg font-bold capitalize">create new space</header>
    <SpaceForm v-model="modelValue" class="px-4" @submit="handleSubmit"> </SpaceForm>
  </div>
</template>
