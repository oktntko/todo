import { trpc, type RouterOutput } from '~/lib/trpc';

export const useGroupStore = defineStore('group', () => {
  const storedGroupList = ref<RouterOutput['group']['list']>([]);

  async function fetchGroup() {
    storedGroupList.value = await trpc.group.list.query();
  }

  return { storedGroupList, fetchGroup };
});
