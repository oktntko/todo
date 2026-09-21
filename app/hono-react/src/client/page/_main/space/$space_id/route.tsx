import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getDefaultStore } from 'jotai';

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

  onEnter: function ({ params: $params }) {
    // loader は親コンポーネントの loader の完了を待たずに実行するため、データが取れていないケースがあり空振りする。
    // component の useEffect 内で値をセットすると、親コンポーネントで変更が検出されず、レンダリングされない。
    // （原因不明。 Transition が複雑でレンダリングがスキップされた？ useEffect 内で setTimeout するとレンダリングされる）
    // loader 完了後、レンダリング開始前の onEnter で値をセットしておく。
    const spaceList = Store.get(spaceListAtom);
    Store.set(
      currentSpaceAtom,
      spaceList.find((x) => x.space_id === $params.space_id),
    );
  },

  component: function Layout() {
    return (
      <div className="h-full">
        <Outlet />
      </div>
    );
  },
});
