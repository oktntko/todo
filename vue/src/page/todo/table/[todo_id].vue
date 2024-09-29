<script setup lang="ts">
const route = useRoute('/todo/table/[todo_id]');
</script>

<template>
  <div class="flex flex-row">{{ route.path }}</div>
</template>
