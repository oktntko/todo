import { trpc, type RouterOutput } from '~/lib/trpc';

export const useSpaceStore = defineStore('space', () => {
  const storedSpaceList = ref<RouterOutput['space']['list']>([]);

  async function fetchSpace() {
    storedSpaceList.value = await trpc.space.list.query();
  }

  return { storedSpaceList, fetchSpace };
});
