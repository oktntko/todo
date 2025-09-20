import { trpc, type RouterOutput } from '~/lib/trpc';

export const useMypageStore = defineStore('mypage', () => {
  const mypage = ref<RouterOutput['mypage']['get']>();

  async function fetchMypage() {
    mypage.value = await trpc.mypage.get.query();
  }

  return { mypage, fetchMypage };
});
