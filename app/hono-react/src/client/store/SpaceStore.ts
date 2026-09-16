import { type InferResponseType } from 'hono';
import { atom, useAtom } from 'jotai';

import { hono } from '~/middleware/hono';
import { useParams } from '~/router';

const spaceListAtom = atom<InferResponseType<typeof hono.space.list.$post>>([]);

export function useSpaceStore() {
  const $params = useParams('/space/:space_id');

  const [spaceList, setSpaceList] = useAtom(spaceListAtom);

  async function fetchSpace() {
    setSpaceList(await hono.space.list.$post().unwrap());
  }

  const index = spaceList.findIndex((space) => space.space_id === $params.space_id);
  const currentSpace: InferResponseType<typeof hono.space.list.$post>[number] | null =
    spaceList[index] ?? null;

  return { spaceList, fetchSpace, currentSpace };
}
