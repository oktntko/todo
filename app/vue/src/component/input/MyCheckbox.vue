<script setup lang="ts">
import { useAttrs } from 'vue';

// https://ja.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance
defineOptions({ inheritAttrs: false });

defineProps<{
  id?: string;
  type: 'checkbox' | 'radio';
  value?: boolean | string | number;
}>();

const $attrs = useAttrs();

const modelValue = defineModel<boolean | string | number | (string | number)[]>({ default: false });
</script>

<template>
  <label :for="id" class="flex items-center gap-1 text-sm font-medium text-gray-900">
    <input
      v-bind="{ ...$attrs, id }"
      v-model="modelValue"
      :type="type"
      :value="value"
      class="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
    />
    <slot />
  </label>
</template>
