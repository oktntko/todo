import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { hono } from '~/middleware/hono';
import { aichatListAtom } from '~/store/AichatStore';
import { groupListAtom } from '~/store/GroupStore';
import { currentSpaceAtom, spaceListAtom } from '~/store/SpaceStore';

const Store = getDefaultStore();

export const Route = createFileRoute('/_main/space/$space_id')({
  loader: async function ({ params: $params }) {
    const groupList = await hono.group.list
      .$post({ json: { space_id: $params.space_id } })
      .unwrap();
    Store.set(groupListAtom, groupList);

    const aichatList = await hono.aichat.list
      .$post({ json: { space_id: $params.space_id } })
      .unwrap();
    Store.set(aichatListAtom, aichatList);
  },

  component: function Layout() {
    const $params = useParams({ from: '/_main/space/$space_id' });

    const spaceList = useAtomValue(spaceListAtom);
    const setCurrentSpace = useSetAtom(currentSpaceAtom);
    useEffect(() => {
      setCurrentSpace(spaceList.find((x) => x.space_id === $params.space_id));
    }, [$params.space_id, spaceList, setCurrentSpace]);

    return (
      <div className="h-full">
        <Outlet />
      </div>
    );
  },
});
