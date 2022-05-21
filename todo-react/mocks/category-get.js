const { category } = require("./data-generators");

module.exports = {
  path: "/api/categories/:category_id",
  method: "GET",
  cache: false,
  delay: 300 /*ms*/,
  template: (params) => category(params.category_id),
};
