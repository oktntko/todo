<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import SpaceForm, { type ModelValue } from '~/page/todo/list/component/SpaceForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';

const emit = defineEmits<{
  close: [RouterOutput['space']['create']];
}>();

const modelValue = ref<ModelValue>({
  space_name: '',
  space_description: '',
  space_image: '',
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
  try {
    const space = await trpc.space.create.mutate(input);

    emit('close', space);

    $toast.success('Data has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="sm:w-96 p-4">
    <header class="capitalize mb-4 text-lg font-bold">create new space</header>
    <SpaceForm v-model="modelValue" @submit="handleSubmit"> </SpaceForm>
  </div>
</template>
