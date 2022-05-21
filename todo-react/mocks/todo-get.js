const { todo } = require("./data-generators");

module.exports = {
  path: "/api/todos/:todo_id",
  method: "GET",
  template: (params) => todo(params.todo_id),
};
