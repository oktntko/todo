<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import WhiteboardSpaceForm, {
  type ModelValue,
} from '~/page/index/todo/component/WhiteboardSpaceForm.vue';
import { useLoading } from '~/plugin/LoadingPlugin';
import { useToast } from '~/plugin/ToastPlugin';

const emit = defineEmits<{
  close: [{ event: 'update' | 'delete'; whiteboard: RouterOutput['whiteboard']['update'] }];
}>();

const props = defineProps<{
  whiteboard_id: number;
}>();

const modelValue = ref<ModelValue>();
let updated_at = new Date();

onMounted(async () => {
  const whiteboard = await trpc.whiteboard.get.query({ whiteboard_id: props.whiteboard_id });
  modelValue.value = whiteboard;
  updated_at = whiteboard.updated_at;
});

const $toast = useToast();
const $loading = useLoading();

async function handleSubmit(input: ModelValue) {
  const loading = $loading.open();
  try {
    const whiteboard = await trpc.whiteboard.update.mutate({
      ...input,
      whiteboard_id: props.whiteboard_id,
      updated_at,
    });

    emit('close', { event: 'update', whiteboard });

    $toast.success('Data has been saved.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="p-4">
    <header class="mb-4 text-lg font-bold capitalize">edit whiteboard</header>
    <Transition
      mode="out-in"
      enter-from-class="transform opacity-0"
      enter-active-class="transition ease-out duration-200"
      enter-to-class="transform opacity-100"
    >
      <WhiteboardSpaceForm
        v-if="modelValue"
        v-model="modelValue"
        class="px-4"
        @submit="handleSubmit"
      >
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
                  const whiteboard = await trpc.whiteboard.delete.mutate({
                    whiteboard_id,
                    updated_at,
                  });

                  emit('close', { event: 'delete', whiteboard });
                } finally {
                  loading.close();
                }
              }
            "
          >
            delete
          </button>
        </template>
      </WhiteboardSpaceForm>
      <MyLoading v-else class="flex grow flex-col gap-8"> </MyLoading>
    </Transition>
  </div>
</template>
