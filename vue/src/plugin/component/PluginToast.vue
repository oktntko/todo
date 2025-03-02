<script setup lang="ts">
const {
  colorset = 'blue',
  icon = 'icon-[bx--info-circle]',
  message = '',
  duration = 2000 /*ms*/,
} = defineProps<{
  colorset?: 'blue' | 'green' | 'yellow' | 'red';
  icon?: string;
  message?: string;
  duration?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const open = ref(false);

onMounted(() => {
  open.value = true;

  setTimeout(close, duration);
});

function close() {
  open.value = false;
  setTimeout(() => emit('close'), 200);
}
</script>

<template>
  <Transition
    enter-from-class="transform opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-active-class="transition ease-out duration-200"
    enter-to-class="transform opacity-100 translate-y-0 sm:scale-100"
    leave-from-class="transform opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-to-class="transform opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="open"
      class="relative mt-4 flex max-w-xs justify-between rounded-lg p-2 text-gray-500 shadow-md"
      :class="{
        'bg-green-100 dark:bg-green-800' /*   */: colorset === 'green',
        'bg-yellow-100 dark:bg-yellow-800' /* */: colorset === 'yellow',
        'bg-red-100 dark:bg-red-800' /*       */: colorset === 'red',
        'bg-blue-100 dark:bg-blue-800' /*     */: colorset === 'blue',
      }"
    >
      <div class="flex items-center gap-2">
        <div
          class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-lg"
          :class="{
            'text-green-500 dark:text-green-200' /*   */: colorset === 'green',
            'text-yellow-500 dark:text-yellow-200' /* */: colorset === 'yellow',
            'text-red-500 dark:text-red-200' /*       */: colorset === 'red',
            'text-blue-500 dark:text-blue-200' /*     */: colorset === 'blue',
          }"
        >
          <span class="icon h-5 w-5" :class="icon" />
        </div>

        <div class="min-w-0 grow">
          <div class="inline-block max-w-full text-sm break-words whitespace-pre-wrap">
            {{ message }}
          </div>
        </div>

        <button
          type="button"
          class="relative flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-gray-200"
          aria-label="Close"
          @click="close"
        >
          <span class="icon-[bi--x] h-5 w-5" />
          <span class="sr-only capitalize">close</span>
        </button>
      </div>
    </div>
  </Transition>
</template>
