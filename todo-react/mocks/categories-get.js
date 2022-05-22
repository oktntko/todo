const { category } = require("./data-generators");
const { faker } = require("@faker-js/faker");

module.exports = {
  path: "/api/categories",
  method: "GET",
  cache: false,
  delay: 300 /*ms*/,
  template: () => {
    const total = faker.datatype.number({ min: 0, max: 8 });
    const categories = [...Array(total)].map(category);
    return {
      categories,
    };
  },
};
