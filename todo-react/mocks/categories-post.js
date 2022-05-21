module.exports = {
  path: "/api/categories",
  method: "POST",
  cache: false,
  delay: 300 /*ms*/,
  template: () => ({ category_id: 1 }),
};
