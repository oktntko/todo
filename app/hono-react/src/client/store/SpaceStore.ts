import { type InferResponseType } from 'hono';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import { hono } from '~/middleware/hono';
import { useParams } from '~/router';

const spaceListAtom = atom<InferResponseType<typeof hono.space.list.$get>>([]);

export function useSpaceStore() {
  const $params = useParams('/space/:space_id');

  const [spaceList, setSpaceList] = useAtom(spaceListAtom);

  async function fetchSpace() {
    setSpaceList(await hono.space.list.$get().unwrap());
  }

  const index = spaceList.findIndex((space) => space.space_id === $params.space_id);
  const currentSpace: InferResponseType<typeof hono.space.list.$get>[number] | null =
    spaceList[index] ?? null;

  useEffect(() => {
    const index = spaceList.findIndex((space) => space.space_id === $params.space_id);

    if (index < 0 || currentSpace == null) {
      return;
    }

    setSpaceList((prevList) => {
      const nextList = [...prevList];
      nextList[index] = currentSpace;
      return nextList;
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSpace]);

  return { spaceList, fetchSpace, currentSpace };
}
