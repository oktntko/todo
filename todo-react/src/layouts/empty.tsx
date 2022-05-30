import { Outlet } from "react-router-dom";

export function EmptyLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}
