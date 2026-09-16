import { type InferResponseType } from 'hono';
import { atom, useAtom } from 'jotai';

import { hono } from '~/middleware/hono';

const mypageAtom = atom<InferResponseType<typeof hono.mypage.$get>>({
  description: '',
  email: '',
  username: '',
  avatar_image: '',
  twofa_enable: false,
});

export function useMypageStore() {
  const [mypage, setMypage] = useAtom(mypageAtom);

  async function fetchMypage() {
    setMypage(await hono.mypage.$get().unwrap());
  }

  return { mypage, setMypage, fetchMypage };
}
