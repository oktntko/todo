import { trpc, type RouterOutput } from '~/lib/trpc';

export const useGroupStore = defineStore('group', () => {
  const storedGroupList = ref<RouterOutput['group']['list']>([]);

  async function fetchGroup({ space_id }: { space_id: string }) {
    storedGroupList.value = await trpc.group.list.query({ space_id });
  }

  return { storedGroupList, fetchGroup };
});
