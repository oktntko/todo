<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    colorset?: 'blue' | 'green' | 'yellow' | 'red';
    icon?: string;
    message?: string;
    duration?: number;
  }>(),
  {
    colorset: 'blue',
    icon: 'icon-[bx--info-circle]',
    message: '',
    duration: 2000 /*ms*/,
  },
);

const emit = defineEmits<{
  close: [];
}>();

const open = ref(false);

onMounted(() => {
  open.value = true;

  setTimeout(close, props.duration);
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
      class="mt-4 flex max-w-xs justify-between rounded-lg p-4 text-gray-500 shadow-md dark:bg-gray-800 dark:text-gray-400"
      :class="{
        'bg-green-100 dark:bg-green-800' /*   */: colorset === 'green',
        'bg-yellow-100 dark:bg-yellow-800' /* */: colorset === 'yellow',
        'bg-red-100 dark:bg-red-800' /*       */: colorset === 'red',
        'bg-blue-100 dark:bg-blue-800' /*     */: colorset === 'blue',
      }"
    >
      <div class="flex items-center gap-2">
        <div
          class="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-lg"
          :class="{
            'text-green-500 dark:text-green-200' /*   */: colorset === 'green',
            'text-yellow-500 dark:text-yellow-200' /* */: colorset === 'yellow',
            'text-red-500 dark:text-red-200' /*       */: colorset === 'red',
            'text-blue-500 dark:text-blue-200' /*     */: colorset === 'blue',
          }"
        >
          <span class="h-5 w-5 icon" :class="icon" />
        </div>
        <div class="text-sm font-normal">{{ message }}</div>
      </div>

      <button
        type="button"
        class="rounded-lg bg-transparent p-1.5 text-gray-400 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:text-gray-500 dark:hover:text-white"
        aria-label="Close"
        @click="close"
      >
        <span class="h-5 w-5 icon-[bi--x]" />
      </button>
    </div>
  </Transition>
</template>
