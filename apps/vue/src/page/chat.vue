<script setup lang="ts">
const route = useRoute('/chat');
</script>

<template>
  <div class="flex flex-row">{{ route.path }}</div>
</template>
