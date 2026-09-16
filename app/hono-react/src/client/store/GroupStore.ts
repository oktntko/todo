import { type InferResponseType } from 'hono';
import { atom, useAtom } from 'jotai';

import { hono } from '~/middleware/hono';

const groupListAtom = atom<InferResponseType<typeof hono.group.list.$post>>([]);

export function useGroupStore() {
  const [groupList, setGroupList] = useAtom(groupListAtom);

  async function fetchGroup(json: { space_id: string }) {
    setGroupList(await hono.group.list.$post({ json }).unwrap());
  }

  return { groupList, fetchGroup };
}
