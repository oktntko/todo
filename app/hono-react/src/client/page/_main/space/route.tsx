import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/space')({
  component: function Layout() {
    return (
      <div className="h-full">
        <Outlet />
      </div>
    );
  },
});
