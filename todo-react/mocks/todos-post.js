module.exports = {
  path: "/api/todos",
  method: "POST",
  cache: false,
  delay: 300 /*ms*/,
  template: () => ({ todo_id: 1 }),
};
