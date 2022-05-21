const { category } = require("./data-generators");

module.exports = {
  path: "/api/categories/:category_id",
  method: "GET",
  template: () => {
    const total = faker.datatype.number({ min: 0, max: 6 });
    const categories = [...Array(total)].map(category);
    return {
      categories,
    };
  },
};
