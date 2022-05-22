import React from "react";
import { Outlet } from "react-router-dom";

export const EmptyLayout = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};
