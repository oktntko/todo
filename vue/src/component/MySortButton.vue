<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue';

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  field: string;
  sort: {
    field: string;
    order: 'asc' | 'desc' | '';
  };
}

defineProps<Props>();
</script>

<template>
  <button
    v-bind="$props"
    :title="field === sort.field ? sort.order : ''"
    class="inline-flex items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-200"
    :class="{ 'text-blue-500': field === sort.field }"
  >
    <span
      :class="{
        'icon-[fa6-solid--sort]': field !== sort.field || sort.order === '',
        'icon-[fa6-solid--sort-up]': field === sort.field && sort.order === 'asc',
        'icon-[fa6-solid--sort-down]': field === sort.field && sort.order === 'desc',
      }"
      class="h-3 w-3"
    ></span>
  </button>
</template>
