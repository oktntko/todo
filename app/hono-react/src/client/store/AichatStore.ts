import { type InferResponseType } from 'hono';
import { atom, useAtom } from 'jotai';

import { hono } from '~/middleware/hono';

const aichatListAtom = atom<InferResponseType<typeof hono.aichat.list.$post>>([]);

export function useAichatStore() {
  const [aichatList, setAichatList] = useAtom(aichatListAtom);

  async function fetchAichat(json: { space_id: string }) {
    setAichatList(await hono.aichat.list.$post({ json }).unwrap());
  }

  return { aichatList, fetchAichat };
}
