module.exports = {
  path: "/api/todos/:todo_id",
  method: "PUT",
  cache: false,
  delay: 300 /*ms*/,
  template: (params) => ({ todo_id: params.todo_id }),
};
