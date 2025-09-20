import { trpc, type RouterOutput } from '~/lib/trpc';

export const useMypageStore = defineStore('mypage', () => {
  const mypage = ref<RouterOutput['mypage']['get']>({
    description: '',
    email: '',
    username: '',
    avatar_image: '',
    twofa_enable: false,
    aichat_enable: false,
    aichat_model: '',
  });

  async function fetchMypage() {
    mypage.value = await trpc.mypage.get.query();
  }

  return { mypage, fetchMypage };
});
