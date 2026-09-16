import { Outlet } from 'react-router';

import { Link } from '~/router';

export default function Layout() {
  return (
    <div className="container mx-auto flex max-w-5xl flex-row">
      <aside className="flex w-56 shrink-0 flex-col gap-2 px-4">
        <div>
          <ul className="text-sm">
            {(
              [
                {
                  name: 'profile',
                  route: '/mypage',
                  icon: 'icon-[material-symbols--public]',
                },
                {
                  name: 'change password',
                  route: '/mypage/change-password',
                  icon: 'icon-[mdi--password-outline]',
                },
                {
                  name: 'security',
                  route: '/mypage/security',
                  icon: 'icon-[wpf--security-checked]',
                },
                {
                  name: 'notification',
                  route: '/mypage/notification',
                  icon: 'icon-[bx--notification]',
                },
                {
                  name: 'account',
                  route: '/mypage/account',
                  icon: 'icon-[codicon--account]',
                },
              ] as const
            ).map((item) => {
              return (
                <li key={item.route}>
                  <Link
                    to={item.route}
                    className="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 transition-colors hover:bg-gray-100"
                    // exact-active-className="text-blue-600 border-l-blue-400!"
                  >
                    <span
                      className={`${item.icon} h-5 w-5 text-gray-500 group-hover:text-gray-900`}
                    />
                    <span className="capitalize">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 grow">
        <Outlet />
      </div>
    </div>
  );
}
