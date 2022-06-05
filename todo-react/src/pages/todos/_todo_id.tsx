import { useParams } from "react-router";
import { TodoForm } from "~/forms/TodoForm";

export function TodoSyosaiPage() {
  const { todo_id } = useParams();

  return <TodoForm todo_id={todo_id} />;
}
