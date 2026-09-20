import { type InferResponseType } from 'hono';
import { atom } from 'jotai';

import { hono } from '~/middleware/hono';

export const mypageAtom = atom<InferResponseType<typeof hono.mypage.$get>>({
  description: '',
  email: '',
  username: '',
  avatar_image: '',
  twofa_enable: false,
});
