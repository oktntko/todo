<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import SpaceForm, { type ModelValue } from '~/page/todo/list/component/SpaceForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';

const emit = defineEmits<{
  close: [RouterOutput['space']['update']];
}>();

const props = defineProps<{
  space_id: number;
}>();

const modelValue = ref<ModelValue>();
const updated_at = ref(new Date());

onMounted(async () => {
  const space = await trpc.space.get.query({ space_id: props.space_id });
  modelValue.value = space;
  updated_at.value = space.updated_at;
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
  try {
    const space = await trpc.space.update.mutate({
      ...input,
      space_id: props.space_id,
      updated_at: updated_at.value,
    });

    emit('close', space);

    $toast.success('Data has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="p-4 sm:w-96">
    <header class="mb-4 text-lg font-bold capitalize">edit space</header>
    <Transition
      mode="out-in"
      enter-from-class="transform opacity-0"
      enter-active-class="transition ease-out duration-200"
      enter-to-class="transform opacity-100"
    >
      <SpaceForm v-if="modelValue" v-model="modelValue" @submit="handleSubmit"> </SpaceForm>
      <MyLoading v-else class="flex grow flex-col gap-8"> </MyLoading>
    </Transition>
  </div>
</template>
