import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { TodoForm } from "~/forms/TodoForm";

export function TodoSyosaiPage() {
  const { todo_id } = useParams();
  const navigate = useNavigate();

  return <TodoForm todo_id={todo_id} onSuccess={() => navigate("/todos")} />;
}
