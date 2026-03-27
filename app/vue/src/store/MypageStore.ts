import { defineStore } from 'pinia';
import { ref } from 'vue';

import { trpc, type RouterOutput } from '~/lib/trpc';

export const useMypageStore = defineStore('mypage', () => {
  const mypage = ref<RouterOutput['mypage']['get']>({
    description: '',
    email: '',
    username: '',
    avatar_image: '',
    twofa_enable: false,
  });

  async function fetchMypage() {
    mypage.value = await trpc.mypage.get.query();
  }

  return { mypage, fetchMypage };
});
