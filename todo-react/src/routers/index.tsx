import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "~/layouts/dashboard";
import { EmptyLayout } from "~/layouts/empty";
import { NotFoundPage } from "~/pages/404";
import { CategoryIndexPage } from "~/pages/categories";
import { ProjectIndexPage } from "~/pages/projects";
import { StatusIndexPage } from "~/pages/statuses";
import { TodoIndexPage } from "~/pages/todos";

export function RouterView() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<CategoryIndexPage />} />
          <Route path="/statuses" element={<StatusIndexPage />} />
          <Route path="/categories" element={<CategoryIndexPage />} />
          <Route path="/projects" element={<ProjectIndexPage />} />
          <Route path="/todos" element={<TodoIndexPage />} />
        </Route>
        <Route element={<EmptyLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
