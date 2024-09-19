import { trpc, type RouterOutput } from '~/lib/trpc';

export const useTagStore = defineStore('tag', () => {
  const tagStoreData = ref<RouterOutput['tag']['list']>({
    total: 0,
    tag_list: [],
  });

  async function fetchTagList() {
    tagStoreData.value = await trpc.tag.list.query({
      where: {},
      sort: {
        field: 'tag_order',
        order: 'asc',
      },
    });
  }

  return { tagStoreData, fetchTagList };
});
