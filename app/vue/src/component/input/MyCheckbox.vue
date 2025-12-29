<script setup lang="ts">
// https://ja.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance
defineOptions({ inheritAttrs: false });

import type { InputHTMLAttributes } from 'vue';

interface Attrs extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'type'> {
  type: 'checkbox' | 'radio';
}

const $attrs = useAttrs();
const $props = defineProps<Attrs>();
const $bind = computed(() => ({
  ...$attrs,
  ...$props,
}));

const modelValue = defineModel<boolean | string | number | (string | number)[]>({ default: false });
</script>

<template>
  <label :for="$bind.id" class="flex items-center gap-1 text-sm font-medium text-gray-900">
    <input
      v-bind="$bind"
      v-model="modelValue"
      class="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
    />
    <slot />
  </label>
</template>
