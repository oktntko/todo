import equal from "fast-deep-equal";
import { Field, FieldInputProps, Form, Formik } from "formik";
import { motion, PanInfo, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { useRef } from "react";
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
  statusStyle,
  tagId,
  tagStyle,
  TodoType,
  useSelections,
  useTodo,
} from "~/hooks/todos";
import { components } from "~/repositories/schema";

const BOARD_COL = "board-col";

export function TodoBoardPage() {
  const selections = useSelections();
  const { todos, setTodos, postTodos, putTodos, deleteTodos, doneTodos, moveStatusTodos } =
    useTodo();

  const ref = useRef<HTMLDivElement>(null);

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

  const handleAdd = (status: components["schemas"]["StatusResponse"]) => {
    setTodos(update(todos, { $push: [newdata(todos.length, { status_id: status.status_id })] }));
  };

  const handleStatusMove = (index: number, todo_id: string | number, status_id: number) => {
    setTodos(update(todos, { [index]: { status_id: { $set: status_id } } }));
    if (typeof todo_id === "number") {
      moveStatusTodos(todo_id, status_id);
    }
  };

  return (
    <>
      <div className="my-4 flex flex-wrap justify-center gap-4 md:px-4 xl:flex-nowrap" ref={ref}>
        {selections.statuses.map((status) => (
          <div key={status.status_id} className="w-full max-w-screen-md">
            <div className="px-4 pb-2 text-sm md:px-0 ">{statusStyle(status)}</div>
            <div
              className={`${BOARD_COL} self-start transition-shadow`}
              data-status_id={`${status.status_id}`}
            >
              {todos.map((todo, index) => {
                if (todo.status_id === status.status_id) {
                  return (
                    <TodoRow
                      key={todo.todo_id}
                      index={index}
                      todo={todo}
                      onSubmit={handleSubmit}
                      onDelete={handleDelete}
                      onDone={handleDone}
                      onStatusMove={handleStatusMove}
                      dragRange={ref}
                      {...selections}
                    />
                  );
                } else {
                  return null;
                }
              })}
              <div className="flex flex-row flex-nowrap items-center justify-start space-x-2">
                <Button
                  type="button"
                  className="flex flex-grow items-center space-x-2 rounded-none border-0 bg-neutral-100 p-2 hover:bg-slate-200"
                  onClick={() => handleAdd(status)}
                >
                  <BsPlus />
                  <span>追加</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

type TodoRowProps = {
  index: number;
  todo: TodoType;
  onSubmit: (index: number, values: TodoType) => void;
  onDelete: (index: number, values: TodoType) => void;
  onDone: (index: number, values: TodoType) => void;
  onStatusMove: (index: number, todo_id: string | number, status_id: number) => void;
  statuses: components["schemas"]["StatusResponse"][];
  categories: components["schemas"]["CategoryResponse"][];
  projects: components["schemas"]["ProjectResponse"][];
  tags: components["schemas"]["TagResponse"][];
  dragRange: React.RefObject<HTMLDivElement>;
};

function TodoRow(props: TodoRowProps) {
  const dragControls = useDragControls();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    const col = elements.find((element) => element.classList.contains(BOARD_COL));
    if (col) {
      col.classList.remove(...classList);
      const status_id = col.getAttribute("data-status_id");
      if (status_id) {
        props.onStatusMove(props.index, props.todo.todo_id, Number(status_id));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={props.todo.todo_id}
      drag
      dragConstraints={props.dragRange}
      dragSnapToOrigin
      className="border-b"
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      dragListener={false}
      dragControls={dragControls}
    >
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
  );
}

const classList = ["border-blue-600/50", "shadow-xl"];

const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
  const cols = document.getElementsByClassName(BOARD_COL);
  const elements = document.elementsFromPoint(info.point.x, info.point.y);
  const hovering = elements.find((e) => e.classList.contains(BOARD_COL));
  for (const col of cols) {
    if (col === hovering) {
      col.classList.add(...classList);
    } else {
      col.classList.remove(...classList);
    }
  }
};
