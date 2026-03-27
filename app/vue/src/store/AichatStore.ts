import { defineStore } from 'pinia';
import { ref } from 'vue';

import { trpc, type RouterOutput } from '~/lib/trpc';

export const useAichatStore = defineStore('aichat', () => {
  const storedAichatList = ref<RouterOutput['aichat']['list']>([]);

  async function fetchAichat({ space_id }: { space_id: string }) {
    storedAichatList.value = await trpc.aichat.list.query({ space_id });
  }

  return { storedAichatList, fetchAichat };
});
