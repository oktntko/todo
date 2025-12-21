<script setup lang="ts">
import { MessageSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';

const $dialog = useDialog();

const data = ref<RouterOutput['aichat']['list']>([]);
const loading = ref(false);

const modelValue = ref<z.infer<typeof MessageSchema>>({
  role: 'user',
  content: '',
});

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await trpc.aichat.list.query({});
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  const loading = $dialog.loading();
  try {
    data.value = await trpc.aichat.chat.mutate({
      messages: data.value,
      message: modelValue.value,
    });
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div class="">
    <div v-for="({ message }, i) in data" :key="i">
      <div>{{ message.role }}</div>
      <div>{{ message.content }}</div>
    </div>
    <form @submit.prevent="handleSubmit">
      <div>
        <textarea v-model="modelValue.content" class="w-full bg-white"></textarea>
      </div>
      <button type="submit">send</button>
    </form>
  </div>
</template>
