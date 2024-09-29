<script setup lang="ts">
const route = useRoute('/todo/calendar');
</script>

<template>
  <div class="flex flex-row">{{ route.path }}</div>
</template>
