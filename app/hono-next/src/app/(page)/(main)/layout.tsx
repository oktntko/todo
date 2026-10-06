import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthProvider } from '@/plugin/AuthProvider';
import { CsrProvider } from '@/plugin/CsrProvider';
import { findOperatorFromTokenSSR } from '~/middleware/auth';
import { removeSymbol } from '~/middleware/prisma';
import { NotificationService } from '~/service/NotificationService';
import { SpaceService } from '~/service/SpaceService';

import { MainHeader } from './component/MainLayout/MainHeader';
import { MainMenuSidebar } from './component/MainLayout/MainMenuLink';
import { MainStateProvider } from './component/MainState/MainStateProvider';

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  const operator = await findOperatorFromTokenSSR();
  if (operator == null) {
    return redirect('/signin');
  }

  const space_list = await SpaceService.listSpace({ operator }).then(removeSymbol);
  const notification_list = await NotificationService.listNotification({ operator }).then(
    removeSymbol,
  );

  return (
    <MainStateProvider space_list={space_list} notification_list={notification_list}>
      <CsrProvider>
        <AuthProvider operator={operator}>
          <div className="flex h-dvh">
            {/* sidebar */}
            <aside className="flex h-dvh min-h-0 w-56 shrink-0 flex-col overflow-y-auto bg-gray-900 text-gray-50">
              <Link
                href="/space"
                className="flex items-center gap-1 p-4 text-2xl font-semibold transition-colors hover:text-gray-200"
              >
                <span className="icon-[flat-color-icons--todo-list] h-8 w-8 p-2" />
                <span>MyTodo</span>
              </Link>

              <MainMenuSidebar />
            </aside>

            {/* main */}
            <div className="flex min-h-0 grow flex-col overflow-y-auto bg-gray-100 text-gray-900">
              <MainHeader />

              <div className="grow">{children}</div>
            </div>
          </div>
        </AuthProvider>
      </CsrProvider>
    </MainStateProvider>
  );
}
