import client from "~/libs/axios";
import { paths } from "~/repositories/schema";

const statuses = {
  get: {
    statuses: async () => {
      return client.get<
        paths["/api/statuses"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/statuses`);
    },
    status: async (path: paths["/api/statuses/{status_id}"]["get"]["parameters"]["path"]) => {
      return client.get<
        paths["/api/statuses/{status_id}"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/statuses/${path.status_id}`);
    },
  },
  post: {
    statuses: async (
      body: paths["/api/statuses"]["post"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.post<
        paths["/api/statuses"]["post"]["responses"]["200"]["content"]["application/json"]
      >(`/api/statuses`, body);
    },
  },
  put: {
    statuses: async (
      path: paths["/api/statuses/{status_id}"]["put"]["parameters"]["path"],
      body: paths["/api/statuses/{status_id}"]["put"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.put<
        paths["/api/statuses/{status_id}"]["put"]["responses"]["200"]["content"]["application/json"]
      >(`/api/statuses/${path.status_id}`, body);
    },
  },
  delete: {
    statuses: async (
      path: paths["/api/statuses/{status_id}"]["delete"]["parameters"]["path"],
      query: paths["/api/statuses/{status_id}"]["delete"]["parameters"]["query"]
    ) => {
      return client.delete<
        paths["/api/statuses/{status_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
      >(`/api/statuses/${path.status_id}`, { params: query });
    },
  },
  patch: {
    statuses: async (
      body: paths["/api/statuses/reorder"]["patch"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.patch<
        paths["/api/statuses/reorder"]["patch"]["responses"]["200"]["content"]["application/json"]
      >(`/api/statuses/reorder`, body);
    },
  },
};

const categories = {
  get: {
    categories: async () => {
      return client.get<
        paths["/api/categories"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/categories`);
    },
    category: async (path: paths["/api/categories/{category_id}"]["get"]["parameters"]["path"]) => {
      return client.get<
        paths["/api/categories/{category_id}"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/categories/${path.category_id}`);
    },
  },
  post: {
    categories: async (
      body: paths["/api/categories"]["post"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.post<
        paths["/api/categories"]["post"]["responses"]["200"]["content"]["application/json"]
      >(`/api/categories`, body);
    },
  },
  put: {
    categories: async (
      path: paths["/api/categories/{category_id}"]["put"]["parameters"]["path"],
      body: paths["/api/categories/{category_id}"]["put"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.put<
        paths["/api/categories/{category_id}"]["put"]["responses"]["200"]["content"]["application/json"]
      >(`/api/categories/${path.category_id}`, body);
    },
  },
  delete: {
    categories: async (
      path: paths["/api/categories/{category_id}"]["delete"]["parameters"]["path"],
      query: paths["/api/categories/{category_id}"]["delete"]["parameters"]["query"]
    ) => {
      return client.delete<
        paths["/api/categories/{category_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
      >(`/api/categories/${path.category_id}`, { params: query });
    },
  },
  patch: {
    categories: async (
      body: paths["/api/categories/reorder"]["patch"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.patch<
        paths["/api/categories/reorder"]["patch"]["responses"]["200"]["content"]["application/json"]
      >(`/api/categories/reorder`, body);
    },
  },
};

const projects = {
  get: {
    projects: async () => {
      return client.get<
        paths["/api/projects"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/projects`);
    },
    project: async (path: paths["/api/projects/{project_id}"]["get"]["parameters"]["path"]) => {
      return client.get<
        paths["/api/projects/{project_id}"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/projects/${path.project_id}`);
    },
  },
  post: {
    projects: async (
      body: paths["/api/projects"]["post"]["requestBody"]["content"]["application/json"] & {
        icon?: File | null;
      }
    ) => {
      const data = new FormData();
      Object.entries(body).map(([key, value]) => data.append(key, value as string));

      return client.post<
        paths["/api/projects"]["post"]["responses"]["200"]["content"]["application/json"]
      >(`/api/projects`, data);
    },
  },
  put: {
    projects: async (
      path: paths["/api/projects/{project_id}"]["put"]["parameters"]["path"],
      body: paths["/api/projects/{project_id}"]["put"]["requestBody"]["content"]["application/json"] & {
        icon?: File | null;
      }
    ) => {
      const data = new FormData();
      Object.entries(body).map(([key, value]) => data.append(key, value as string));

      return client.put<
        paths["/api/projects/{project_id}"]["put"]["responses"]["200"]["content"]["application/json"]
      >(`/api/projects/${path.project_id}`, data);
    },
  },
  delete: {
    projects: async (
      path: paths["/api/projects/{project_id}"]["delete"]["parameters"]["path"],
      query: paths["/api/projects/{project_id}"]["delete"]["parameters"]["query"]
    ) => {
      return client.delete<
        paths["/api/projects/{project_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
      >(`/api/projects/${path.project_id}`, { params: query });
    },
  },
  patch: {
    projects: async (
      body: paths["/api/projects/reorder"]["patch"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.patch<
        paths["/api/projects/reorder"]["patch"]["responses"]["200"]["content"]["application/json"]
      >(`/api/projects/reorder`, body);
    },
  },
};

const tags = {
  get: {
    tags: async () => {
      return client.get<
        paths["/api/tags"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/tags`);
    },
    tag: async (path: paths["/api/tags/{tag_id}"]["get"]["parameters"]["path"]) => {
      return client.get<
        paths["/api/tags/{tag_id}"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/tags/${path.tag_id}`);
    },
  },
  post: {
    tags: async (
      body: paths["/api/tags"]["post"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.post<
        paths["/api/tags"]["post"]["responses"]["200"]["content"]["application/json"]
      >(`/api/tags`, body);
    },
  },
  put: {
    tags: async (
      path: paths["/api/tags/{tag_id}"]["put"]["parameters"]["path"],
      body: paths["/api/tags/{tag_id}"]["put"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.put<
        paths["/api/tags/{tag_id}"]["put"]["responses"]["200"]["content"]["application/json"]
      >(`/api/tags/${path.tag_id}`, body);
    },
  },
  delete: {
    tags: async (
      path: paths["/api/tags/{tag_id}"]["delete"]["parameters"]["path"],
      query: paths["/api/tags/{tag_id}"]["delete"]["parameters"]["query"]
    ) => {
      return client.delete<
        paths["/api/tags/{tag_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
      >(`/api/tags/${path.tag_id}`, { params: query });
    },
  },
  patch: {
    tags: async (
      body: paths["/api/tags/reorder"]["patch"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.patch<
        paths["/api/tags/reorder"]["patch"]["responses"]["200"]["content"]["application/json"]
      >(`/api/tags/reorder`, body);
    },
  },
};

const todos = {
  get: {
    todos: async () => {
      return client.get<
        paths["/api/todos"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos`);
    },
    todo: async (path: paths["/api/todos/{todo_id}"]["get"]["parameters"]["path"]) => {
      return client.get<
        paths["/api/todos/{todo_id}"]["get"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos/${path.todo_id}`);
    },
  },
  post: {
    todos: async (
      body: paths["/api/todos"]["post"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.post<
        paths["/api/todos"]["post"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos`, body);
    },
  },
  put: {
    todos: async (
      path: paths["/api/todos/{todo_id}"]["put"]["parameters"]["path"],
      body: paths["/api/todos/{todo_id}"]["put"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.put<
        paths["/api/todos/{todo_id}"]["put"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos/${path.todo_id}`, body);
    },
  },
  delete: {
    todos: async (
      path: paths["/api/todos/{todo_id}"]["delete"]["parameters"]["path"],
      query: paths["/api/todos/{todo_id}"]["delete"]["parameters"]["query"]
    ) => {
      return client.delete<
        paths["/api/todos/{todo_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos/${path.todo_id}`, { params: query });
    },
  },
  patch: {
    todosReorder: async (
      body: paths["/api/todos/reorder"]["patch"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.patch<
        paths["/api/todos/reorder"]["patch"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos/reorder`, body);
    },
    todosDone: async (
      path: paths["/api/todos/{todo_id}/done"]["patch"]["parameters"]["path"],
      body: paths["/api/todos/{todo_id}/done"]["patch"]["requestBody"]["content"]["application/json"]
    ) => {
      return client.patch<
        paths["/api/todos/{todo_id}/done"]["patch"]["responses"]["200"]["content"]["application/json"]
      >(`/api/todos/${path.todo_id}/done`, body);
    },
  },
};

export const api = {
  get: {
    ...statuses.get,
    ...categories.get,
    ...projects.get,
    ...tags.get,
    ...todos.get,
  },
  post: {
    ...statuses.post,
    ...categories.post,
    ...projects.post,
    ...tags.post,
    ...todos.post,
  },
  put: {
    ...statuses.put,
    ...categories.put,
    ...projects.put,
    ...tags.put,
    ...todos.put,
  },
  delete: {
    ...statuses.delete,
    ...categories.delete,
    ...projects.delete,
    ...tags.delete,
    ...todos.delete,
  },
  patch: {
    ...statuses.patch,
    ...categories.patch,
    ...projects.patch,
    ...tags.patch,
    ...todos.patch,
  },
};
