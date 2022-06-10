import ORM from "~/arch/ORM";
import log from "~/middlewares/log";

const deleteManyTodoTag = async (where: { todo_id: number }) => {
  log.debug("deleteManyTodoTag");

  return ORM.todoTag.deleteMany({
    where,
  });
};

export const TodoTagsRepository = {
  deleteManyTodoTag,
} as const;
