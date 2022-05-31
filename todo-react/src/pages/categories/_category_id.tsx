import { useParams } from "react-router";
import { CategoryForm } from "~/components/CategoryForm";

export function CategorySyosaiPage() {
  const { category_id } = useParams();

  return <CategoryForm category_id={category_id} />;
}
