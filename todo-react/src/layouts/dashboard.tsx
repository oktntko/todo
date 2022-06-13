import { Outlet } from "react-router-dom";
import { Header } from "~/components/Header";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 text-gray-800 dark:text-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
