import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "~/layouts/dashboard";
import { EmptyLayout } from "~/layouts/empty";
import { IndexPage } from "~/pages";
import { NotFoundPage } from "~/pages/404";
import { CategoryIndexPage } from "~/pages/settings/categories";
import { ProjectIndexPage } from "~/pages/settings/projects";
import { StatusIndexPage } from "~/pages/settings/statuses";
import { TagIndexPage } from "~/pages/settings/tags";
import { TodoBoardPage } from "~/pages/todos/board";
import { TodoGanttPage } from "~/pages/todos/gantt";
import { TodoListPage } from "~/pages/todos/list";
import { TodoTablePage } from "~/pages/todos/table";

export const url = {
  settings: {
    statuses: "/settings/statuses",
    categories: "/settings/categories",
    projects: "/settings/projects",
    tags: "/settings/tags",
  },
  todos: {
    list: "todos/list",
    board: "todos/board",
    gantt: "todos/gantt",
    table: "todos/table",
  },
} as const;

export function RouterView() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<IndexPage />} />
          <Route path="/settings/statuses" element={<StatusIndexPage />} />
          <Route path="/settings/categories" element={<CategoryIndexPage />} />
          <Route path="/settings/projects" element={<ProjectIndexPage />} />
          <Route path="/settings/tags" element={<TagIndexPage />} />
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
