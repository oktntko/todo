import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <div>
      <div>top layout</div>
      <Outlet />
    </div>
  );
}
