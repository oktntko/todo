import { createFileRoute, Link, Outlet, useParams } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';

import { MyLoading } from '~/component/MyLoading';
import { currentSpaceAtom } from '~/store/SpaceStore';

export const Route = createFileRoute('/_main/space/$space_id/setting')({
  component: function Layout() {
    const $params = useParams({ from: '/_main/space/$space_id/setting' });

    // ここで currentSpace を待って Props で渡す
    // 子コンポーネントは currentSpace を必須で受け取れる
    const currentSpace = useAtomValue(currentSpaceAtom);

    return (
      <div className="container mx-auto flex max-w-5xl flex-row">
        <aside className="flex w-56 shrink-0 flex-col gap-2 px-4">
          <div>
            <ul className="text-sm">
              <li>
                <Link
                  to="/space/$space_id/setting"
                  params={{ space_id: $params.space_id }}
                  className="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                  activeProps={{ className: 'text-blue-600 border-l-blue-400!' }}
                  activeOptions={{ exact: true }}
                >
                  <span className="icon-[uil--setting] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                  <span className="ml-2 capitalize">general</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/space/$space_id/setting/chat"
                  params={{ space_id: $params.space_id }}
                  className="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                  activeProps={{ className: 'text-blue-600 border-l-blue-400!' }}
                  activeOptions={{ exact: true }}
                >
                  <span className="icon-[vaadin--chat] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                  <span className="ml-2 capitalize">chat</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        <div className="grow">{currentSpace ? <Outlet /> : <MyLoading />}</div>
      </div>
    );
  },
});
