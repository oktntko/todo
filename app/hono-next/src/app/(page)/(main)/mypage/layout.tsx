import { MainHeader } from '@/(main)/space/component/MainLayout/MainHeader';

import { MypageMenuLink } from './MypageMenuLink';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh">
      {/* main */}
      <div className="flex min-h-0 grow flex-col overflow-y-auto bg-gray-100 text-gray-900">
        <MainHeader />

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
                      <MypageMenuLink {...item} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="min-w-0 grow">{children}</div>
        </div>
      </div>
    </div>
  );
}
