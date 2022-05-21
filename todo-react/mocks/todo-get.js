const { todo } = require("./data-generators");

module.exports = {
  path: "/api/todos/:todo_id",
  method: "GET",
  cache: false,
  delay: 300 /*ms*/,
  template: (params) => todo(params.todo_id),
};
