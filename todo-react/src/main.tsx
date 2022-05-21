// main.ts
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "~/main.css";
import { AppRoute } from "~/routers";

function RouterView() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AppRoute />
    </Suspense>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <RouterView />
    </Router>
  </React.StrictMode>
);
