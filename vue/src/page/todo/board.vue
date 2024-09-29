<script setup lang="ts">
const route = useRoute('/todo/board');
</script>

<template>
  <div class="flex flex-row">{{ route.path }}</div>
</template>
