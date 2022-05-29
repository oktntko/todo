import client from "~/libs/axios";
import { paths } from "~/repositories/schema";

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
  patch: {
    todos: {
      done: async (path: paths["/api/todos/{todo_id}/done"]["patch"]["parameters"]["path"]) => {
        return client.patch<
          paths["/api/todos/{todo_id}/done"]["patch"]["responses"]["200"]["content"]["application/json"]
        >(`/api/todos/${path.todo_id}/done`);
      },
      reorder: async (
        body: paths["/api/todos/reorder"]["patch"]["requestBody"]["content"]["application/json"]
      ) => {
        return client.patch<
          paths["/api/todos/reorder"]["patch"]["responses"]["200"]["content"]["application/json"]
        >(`/api/todos/reorder`, body);
      },
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
};

export const api = {
  get: {
    ...categories.get,
    ...todos.get,
  },
  post: {
    ...categories.post,
    ...todos.post,
  },
  put: {
    ...categories.put,
    ...todos.put,
  },
  delete: {
    ...categories.delete,
    ...todos.delete,
  },
  patch: {
    ...todos.patch,
  },
};
