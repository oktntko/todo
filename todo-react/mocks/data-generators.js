const { faker } = require("@faker-js/faker");
const dayjs = require("dayjs");

const todo = (todo_id) => {
  return {
    todo_id: todo_id ? todo_id : faker.datatype.number({ min: 1000, max: 9999 }),
    yarukoto: faker.lorem.sentence(5),
    category_id: faker.datatype.number({ min: 1000, max: 9999 }),
    kizitu: dayjs(faker.date.future()).format("YYYY-MM-DD"),
    yusendo: ["HIGH", "MIDDLE", "LOW"].at(faker.datatype.number({ min: 0, max: 2 })),
    subcategory_id_list: [...Array(4)].map(() => faker.datatype.number({ min: 1000, max: 9999 })),
    memo: faker.lorem.paragraphs(2),
    is_done: [true, false].at(faker.datatype.number({ min: 0, max: 1 })),
    updated_at: dayjs(faker.date.past()).toISOString(),
  };
};

const category = (category_id) => {
  return {
    category_id: category_id ? category_id : faker.datatype.number({ min: 1000, max: 9999 }),
    category_name: faker.lorem.words(1),
    updated_at: dayjs(faker.date.past()).toISOString(),
  };
};

exports.todo = todo;
exports.category = category;
