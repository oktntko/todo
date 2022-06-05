import { Outlet } from "react-router-dom";
import { Header } from "~/components/Header";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden text-gray-800 dark:text-white">
      <div
        className="flex
          flex-grow flex-col flex-nowrap
          bg-neutral-50"
      >
        <nav className="h-16 flex-shrink-0">
          <Header />
        </nav>
        <main className="flex-grow overflow-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
