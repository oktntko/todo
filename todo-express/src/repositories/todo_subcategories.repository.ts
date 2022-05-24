import ORM from "~/arch/ORM";
import log from "~/middlewares/log";

const deleteManyTodoSubcategory = async (where: { todo_id: number }) => {
  log.debug("deleteManyTodoSubcategory");

  return ORM.todoSubcategory.deleteMany({
    where,
  });
};

export const TodoSubcategoriesRepository = { deleteManyTodoSubcategory } as const;
