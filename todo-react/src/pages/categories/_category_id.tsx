import { useParams } from "react-router";
import { CategoryForm } from "~/forms/CategoryForm";

export function CategorySyosaiPage() {
  const { category_id } = useParams();

  return <CategoryForm category_id={category_id} />;
}
