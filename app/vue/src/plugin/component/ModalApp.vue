<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  component: Component;
}>();
</script>

<template>
  <Suspense>
    <!-- main content -->
    <component :is="component" v-bind="$attrs"></component>

    <!-- loading state -->
    <template #fallback>
      <div class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center">
        <div class="flex flex-col items-center">
          <span
            class="icon-[eos-icons--bubble-loading] text-opacity-60 dark:text-opacity-60 h-16 w-16 text-gray-600 dark:text-gray-800"
          ></span>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </template>
  </Suspense>
</template>
