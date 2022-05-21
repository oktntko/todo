const { todo } = require("./data-generators");

module.exports = {
  path: "/api/todos",
  method: "GET",
  template: () => {
    const total = faker.datatype.number({ min: 0, max: 6 });
    const todos = [...Array(total)].map(todo);
    return {
      todos,
    };
  },
};
