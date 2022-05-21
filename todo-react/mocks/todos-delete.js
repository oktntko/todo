module.exports = {
  path: "/api/todos/:todo_id",
  method: "DELETE",
  template: (params) => ({ todo_id: params.todo_id }),
};
