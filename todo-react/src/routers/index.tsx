import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "~/layouts/dashboard";
import { EmptyLayout } from "~/layouts/empty";
import { IndexPage } from "~/pages";
import { NotFoundPage } from "~/pages/404";
import { CategoryIndexPage } from "~/pages/categories";
import { ProjectIndexPage } from "~/pages/projects";
import { StatusIndexPage } from "~/pages/statuses";
import { TagIndexPage } from "~/pages/tags";
import { TodoBoardPage } from "~/pages/todos/board";
import { TodoGanttPage } from "~/pages/todos/gantt";
import { TodoListPage } from "~/pages/todos/list";
import { TodoTablePage } from "~/pages/todos/table";

export function RouterView() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<IndexPage />} />
          <Route path="/statuses" element={<StatusIndexPage />} />
          <Route path="/categories" element={<CategoryIndexPage />} />
          <Route path="/projects" element={<ProjectIndexPage />} />
          <Route path="/tags" element={<TagIndexPage />} />
          <Route path="/todos/list" element={<TodoListPage />} />
          <Route path="/todos/board" element={<TodoBoardPage />} />
          <Route path="/todos/gantt" element={<TodoGanttPage />} />
          <Route path="/todos/table" element={<TodoTablePage />} />
        </Route>
        <Route element={<EmptyLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
