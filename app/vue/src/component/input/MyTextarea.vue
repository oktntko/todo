<script setup lang="ts">
import type { TextareaHTMLAttributes } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends /* @vue-ignore */ Omit<TextareaHTMLAttributes, 'value'> {}

defineProps<Props>();

const modelValue = defineModel<string>({ required: true });
</script>

<template>
  <textarea
    v-model="modelValue"
    v-bind="$props"
    class="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
    :class="[
      'transition hover:bg-white hover:ring-1 hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none',
    ]"
  />
</template>
