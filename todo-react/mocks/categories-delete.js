module.exports = {
  path: "/api/categories/:category_id",
  method: "DELETE",
  template: (params) => ({ category_id: params.category_id }),
};
