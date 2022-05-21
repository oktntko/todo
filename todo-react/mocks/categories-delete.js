module.exports = {
  path: "/api/categories/:category_id",
  method: "DELETE",
  cache: false,
  delay: 300 /*ms*/,
  template: (params) => ({ category_id: params.category_id }),
};
