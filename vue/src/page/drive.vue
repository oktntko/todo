<script setup lang="ts">
const route = useRoute('/drive');
</script>

<template>
  <div class="flex flex-row">{{ route.path }}</div>
</template>
