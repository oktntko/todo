module.exports = {
  path: "/api/todos/:todo_id",
  method: "PATCH",
  template: (params) => ({ todo_id: params.todo_id }),
};
