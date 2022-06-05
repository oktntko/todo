import { useNavigate } from "react-router-dom";
import { TodoForm } from "~/forms/TodoForm";

export function TodoTorokuPage() {
  const navigate = useNavigate();

  return <TodoForm onSuccess={() => navigate("/todos")} />;
}
