module.exports = {
  path: "/api/categories/:category_id",
  method: "PUT",
  template: (params) => ({ category_id: params.category_id }),
};
