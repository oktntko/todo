import { Outlet } from "react-router-dom";
import { Header } from "~/components/Header";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden text-gray-800 dark:text-white">
      <div
        className="flex
          flex-grow flex-col flex-nowrap
          bg-neutral-50"
      >
        <nav className="z-[1] h-16 flex-shrink-0">
          <Header />
        </nav>
        <main className="z-0 flex-grow overflow-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
