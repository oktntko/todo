import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/space/$space_id/table')({
  component: function Layout() {
    return (
      <div className="h-full">
        <Outlet />
      </div>
    );
  },
});
