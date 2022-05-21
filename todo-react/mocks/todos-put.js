module.exports = {
  path: "/api/todos/:todo_id",
  method: "PUT",
  template: (params) => ({ todo_id: params.todo_id }),
};
