import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "~/layouts/dashboard";
import { EmptyLayout } from "~/layouts/empty";
import { NotFoundPage } from "~/pages/404";
import { CategoryIndexPage } from "~/pages/categories";
import { CategoryTorokuPage } from "~/pages/categories/add";
import { CategorySyosaiPage } from "~/pages/categories/_category_id";
import { TodoIndexPage } from "~/pages/todos";

export function RouterView() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<TodoIndexPage />} />
          <Route path="/todos" element={<TodoIndexPage />} />
          <Route path="/categories" element={<CategoryIndexPage />} />
          <Route path="/categories/add" element={<CategoryTorokuPage />} />
          <Route path="/categories/:category_id" element={<CategorySyosaiPage />} />
        </Route>
        <Route element={<EmptyLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
