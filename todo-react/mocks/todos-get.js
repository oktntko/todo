const { todo, category } = require("./data-generators");
const { faker } = require("@faker-js/faker");

module.exports = {
  path: "/api/todos",
  method: "GET",
  cache: false,
  delay: 300 /*ms*/,
  template: () => {
    const total = faker.datatype.number({ min: 0, max: 6 });
    const todos = [...Array(total)].map(() => {
      const t = todo();
      const c = category();
      return {
        todo_id: t.todo_id,
        yarukoto: t.yarukoto,
        category_name: c.category_name,
        kizitu: t.kizitu,
        yusendo: t.yusendo,
        updated_at: t.updated_at,
      };
    });

    return {
      todos,
    };
  },
};
