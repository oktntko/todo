import { useCallback, useEffect, useState } from "react";
import { TableColumn } from "react-data-table-component";
import { Table } from "~/components/Table";
import { categoryStyle, projectStyle, statusStyle, tagStyle, useSelections } from "~/hooks/todos";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function TodoTablePage() {
  const { loading, todos } = useTodo();
  const selections = useSelections();

  const columns: TableColumn<components["schemas"]["TodoResponse"]>[] = [
    { name: "ID", selector: (row) => row.todo_id, grow: 0 },
    {
      name: "Category",
      cell(row) {
        return (
          <div className="flex items-center space-x-2">
            {categoryStyle(
              selections.categories.find((data) => data.category_id === row.category_id)
            )}
          </div>
        );
      },
    },
    {
      name: "Project",
      cell(row) {
        return (
          <div className="flex items-center space-x-2">
            {projectStyle(selections.projects.find((data) => data.project_id === row.project_id))}
          </div>
        );
      },
    },
    {
      name: "ToDo",
      selector: (row) => row.yarukoto ?? "",
      grow: 2,
    },
    {
      name: "Beginning",
      selector: (row) => row.beginning ?? "",
      grow: 0,
    },
    {
      name: "Deadline",
      selector: (row) => row.deadline ?? "",
      grow: 0,
    },
    {
      name: "Status",
      cell(row) {
        return statusStyle(selections.statuses.find((data) => data.status_id === row.status_id));
      },
      grow: 0,
    },
    {
      name: "Memo",
      selector: (row) => row.memo ?? "",
    },
    {
      name: "Tag",
      cell(row) {
        return (
          <div className="flex max-w-full items-center space-x-2">
            {selections.tags
              .filter((tag) => ~row.tag_id_list.indexOf(tag.tag_id))
              .map((t) => tagStyle(t))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="md:my-4 md:px-4">
      <Table columns={columns} data={todos} progressPending={loading} />
    </div>
  );
}

const useTodo = () => {
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<components["schemas"]["TodoResponse"][]>([]);

  const getTodos = useCallback(() => {
    setLoading(true);
    api.get
      .todos()
      .then(({ data }) => setTodos(data.todos))
      .finally(() => setLoading(false));
  }, [todos, loading]);

  useEffect(() => {
    getTodos();
  }, []);

  return { loading, todos, setTodos, getTodos };
};
