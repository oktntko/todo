import equal from "fast-deep-equal";
import { Field, FieldInputProps, Form, Formik } from "formik";
import { motion, Reorder, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { BiCheckCircle, BiSend, BiTrash, BiUndo } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/Button";
import { SelectInput } from "~/components/Input";
import {
  categoryId,
  categoryStyle,
  newdata,
  projectId,
  projectStyle,
  statusId,
  statusStyle,
  tagId,
  tagStyle,
  TodoType,
  useSelections,
  useTodo,
} from "~/hooks/todos";
import { components } from "~/repositories/schema";

export function TodoListPage() {
  const { todos, setTodos, postTodos, putTodos, deleteTodos, patchTodoReorder, doneTodos } =
    useTodo();
  const selections = useSelections();

  const handleReorder = (values: TodoType[]) => {
    const todos = values.map((todo, index) => ({ ...todo, order: index }));
    setTodos(values);

    if (todos.length) {
      patchTodoReorder({
        todos: todos.filter(
          (todo) => typeof todo.todo_id === "number"
        ) as components["schemas"]["TodoReorderBody"][],
      });
    }
  };

  const handleSubmit = (index: number, values: TodoType) => {
    if (typeof values.todo_id === "string") {
      postTodos(index, { ...values, order: index });
    } else {
      putTodos(index, values.todo_id, { ...values, order: index });
    }
  };

  const handleDelete = (index: number, values: TodoType) => {
    if (typeof values.todo_id === "number") {
      deleteTodos(index, values.todo_id, values);
    }
  };

  const handleDone = (index: number, values: TodoType) => {
    if (typeof values.todo_id === "number") {
      doneTodos(index, values.todo_id, values);
    }
  };

  const handleAdd = () => {
    setTodos(update(todos, { $push: [newdata(todos.length)] }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto md:my-4 md:max-w-3xl md:px-4"
      >
        <Reorder.Group values={todos} onReorder={handleReorder} className=" ">
          {todos.map((todo, index) => (
            <TodoRow
              key={todo.todo_id}
              index={index}
              todo={todo}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              onDone={handleDone}
              {...selections}
            />
          ))}
        </Reorder.Group>

        <div className="flex flex-row flex-nowrap items-center justify-start space-x-2 ">
          <Button
            type="button"
            className="flex flex-grow items-center space-x-2 rounded-none border-0 bg-neutral-100 p-2 hover:bg-slate-200"
            onClick={handleAdd}
          >
            <BsPlus />
            <span>追加</span>
          </Button>
        </div>
      </motion.div>
    </>
  );
}

type TodoRowProps = {
  index: number;
  todo: TodoType;
  onSubmit: (index: number, values: TodoType) => void;
  onDelete: (index: number, values: TodoType) => void;
  onDone: (index: number, values: TodoType) => void;
  statuses: components["schemas"]["StatusResponse"][];
  categories: components["schemas"]["CategoryResponse"][];
  projects: components["schemas"]["ProjectResponse"][];
  tags: components["schemas"]["TagResponse"][];
};

function TodoRow(props: TodoRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={props.todo.todo_id}
      value={props.todo}
      dragListener={false}
      dragControls={dragControls}
      className="border-b"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Formik
          initialValues={props.todo}
          enableReinitialize
          onSubmit={(values) => props.onSubmit(props.index, values)}
        >
          {({ values, resetForm }) => {
            const isOriginalValues = equal(values, props.todo);

            return (
              <Form>
                <div
                  className={`flex flex-row flex-nowrap items-center justify-start
                  space-x-2 bg-neutral-100 p-4`}
                >
                  {/* 左側 */}
                  <Button
                    type="button"
                    className="cursor-move border-0"
                    onPointerDown={(event) => dragControls.start(event)}
                  >
                    <MdOutlineDragIndicator className="text-xl" />
                  </Button>

                  {/* 真ん中 */}
                  <div className="flex grow flex-col flex-nowrap space-y-2">
                    {/* １行目 */}
                    <div className="flex flex-wrap items-center space-x-4 text-sm">
                      {/* ステータス */}
                      <Field name="status_id" className="flex items-center py-1">
                        {({ field }: { field: FieldInputProps<number | null> }) => (
                          <SelectInput
                            {...field}
                            multiple={false}
                            options={props.statuses}
                            optionId={statusId}
                            optionStyle={statusStyle}
                            placeholder={"ステータス"}
                          />
                        )}
                      </Field>
                      {/* カテゴリ */}
                      <Field name="category_id" className="flex items-center py-1">
                        {({ field }: { field: FieldInputProps<number | null> }) => (
                          <SelectInput
                            {...field}
                            multiple={false}
                            options={props.categories}
                            optionId={categoryId}
                            optionStyle={categoryStyle}
                            placeholder={"カテゴリ"}
                          />
                        )}
                      </Field>
                      {/* プロジェクト */}
                      <Field name="project_id" className="flex items-center py-1">
                        {({ field }: { field: FieldInputProps<number | null> }) => (
                          <SelectInput
                            {...field}
                            multiple={false}
                            options={props.projects}
                            optionId={projectId}
                            optionStyle={projectStyle}
                            placeholder={"プロジェクト"}
                          />
                        )}
                      </Field>
                      {/* 開始日と期日 */}
                      <div className="flex flex-nowrap items-center space-x-1 py-1">
                        {/* 開始日 */}
                        <Field
                          name="beginning"
                          type="date"
                          className="border-[0.5px] focus:outline-none"
                        />
                        <span> ～ </span>
                        {/* 期日 */}
                        <Field
                          name="deadline"
                          type="date"
                          className="border-[0.5px] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* ２行目 */}
                    <div className="flex items-center space-x-2 ">
                      {/* やること */}
                      <Field
                        type="text"
                        name="yarukoto"
                        className="flex-grow truncate rounded border p-1"
                        maxLength={100}
                      />
                    </div>
                    {/* ３行目 */}
                    <div className="text-xs">
                      <Field name="tag_id_list" className="flex items-center">
                        {({ field }: { field: FieldInputProps<number[]> }) => (
                          <SelectInput
                            {...field}
                            multiple={true}
                            options={props.tags}
                            optionId={tagId}
                            optionStyle={tagStyle}
                            placeholder={"タグ"}
                          />
                        )}
                      </Field>
                    </div>
                  </div>

                  {/* 右側 */}
                  <div className="flex flex-col flex-nowrap items-center space-y-2">
                    <div className="flex flex-row flex-nowrap justify-end space-x-2 ">
                      <Button
                        type="button"
                        className="rounded-3xl p-1"
                        colorset={"white"}
                        disabled={isOriginalValues}
                        onClick={() => {
                          resetForm({ values: props.todo });
                        }}
                      >
                        <BiUndo className="text-lg" />
                      </Button>
                      <Button
                        type="submit"
                        className="rounded-3xl p-1"
                        colorset={"green"}
                        disabled={isOriginalValues || values.yarukoto === ""}
                      >
                        <BiSend className="text-lg" />
                      </Button>
                    </div>
                    <div className="flex flex-row flex-nowrap justify-end space-x-2 ">
                      <Button
                        type="button"
                        className="rounded-3xl p-1"
                        colorset={"yellow"}
                        disabled={typeof values.todo_id === "string"}
                        onClick={() => {
                          props.onDelete(props.index, values);
                        }}
                      >
                        <BiTrash className="text-lg" />
                      </Button>
                      <Button
                        type="button"
                        className="rounded-3xl p-1"
                        colorset={"blue"}
                        disabled={typeof values.todo_id === "string"}
                        onClick={() => {
                          props.onDone(props.index, values);
                        }}
                      >
                        <BiCheckCircle className="text-lg" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </motion.div>
    </Reorder.Item>
  );
}
