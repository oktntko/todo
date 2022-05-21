const { category } = require("./data-generators");

module.exports = {
  path: "/api/categories/:category_id",
  method: "GET",
  template: (params) => category(params.category_id),
};
