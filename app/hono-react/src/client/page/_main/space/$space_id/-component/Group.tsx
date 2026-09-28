import type { TodoStatusSchema } from '@todo/prisma/schema';
import type { InferResponseType } from 'hono';

import { z } from '@todo/lib';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import Sortable from 'sortablejs';

import { cn } from '~/lib/cn';
import { hono } from '~/middleware/hono';

import type { GroupListType } from './GroupList';

import { DynamicTodoForm, type DynamicTodoFormValue } from './DynamicTodoForm';

type Props = {
  space_id: string;
  group: GroupListType[number];
  className?: string;
};

export function Group({ group, ...$props }: Props) {
  const [todo_list, setTodoList] = useState<
    (InferResponseType<typeof hono.todo.list.$post>[number] | DynamicTodoFormValue)[]
  >([]);
  const [loading, setLoading] = useState(true);

  async function handleSubmit({ todo_status }: { todo_status: z.infer<typeof TodoStatusSchema> }) {
    setLoading(true);
    try {
      const result = await hono.todo.list
        .$post({
          json: {
            space_id: $props.space_id,
            group_id_list: [group.group_id],
            todo_status,
          },
        })
        .unwrap();

      setTodoList(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void handleSubmit({ todo_status: 'active' });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortable = useRef<Sortable | null>(null);
  const todoSortableContainer = useRef<HTMLUListElement | null>(null);
  // Element is dropped into the list from another list
  const handleAdd = useEffectEvent((_e: Sortable.SortableEvent) => {
    // コンテナからコンテナへ移動したとき、
    // add => remove の順にイベントが呼び出される。
    // addイベントに、バインドされているオブジェクトの情報は含まれないため、
    // 親コンポーネントにコールバックを渡し、
    // removeイベントが実行されたらコールバックを呼び出してもらう
    // $emit('add', async function (todo: DynamicTodoFormValue) {
    //   if (e.newIndex == null) return;
    //   todo_list.value.splice(e.newIndex, 0, todo);
    //   await nextTick(() => {
    //     // watch で submitを実行するために書き換え
    //     todo_list.value.forEach((x) => {
    //       x.group_id = listInput.value.group_id_list[0]!;
    //     });
    //   });
    // });
  });
  // Element is removed from the list into another list
  const handleRemove = useEffectEvent((_e: Sortable.SortableEvent) => {
    // if (e.oldIndex == null) return;
    // $emit('remove', todo_list.value[e.oldIndex]!);
    // todo_list.value.splice(e.oldIndex, 1);
  });
  // Element dragging ended
  const handleSortEnd = useEffectEvent((e: Sortable.SortableEvent) => {
    const { oldIndex, newIndex, from, to } = e;

    if (from !== to) {
      // 別のコンテナに移動したときは、 onAdd と onRemove でハンドリングする
      return;
    }

    if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
      // 同一コンテナ内でインデックスに変化がないときは、何も操作しない
      return;
    }

    setTodoList((prev) => {
      const todo = prev[oldIndex]!;
      return prev
        .toSpliced(oldIndex, 1)
        .toSpliced(newIndex, 0, todo)
        .map((x, i) => ({
          ...x,
          order: i,
        }));
    });
  });

  useEffect(() => {
    const container = todoSortableContainer.current;
    if (!container) {
      return;
    }

    const sortableInstance = Sortable.create(container, {
      animation: 150,
      group: 'todo',
      handle: '.todo-handle',
      chosenClass: 'bg-blue-100',
      dragClass: 'bg-blue-100',
      onAdd: handleAdd,
      onRemove: handleRemove,
      onEnd: handleSortEnd,
    });
    sortable.current = sortableInstance;

    return () => {
      sortableInstance.destroy();
      sortable.current = null;
    };
  }, []);

  return (
    <div
      className="rounded-sm border border-l-[6px] border-gray-300 bg-white text-sm shadow-sm"
      style={{
        borderLeftColor: group.group_color,
      }}
    >
      <div className="sticky top-0 z-10 bg-white pt-4 pb-2">
        <div className="px-4">
          <div className="flex items-center gap-1 text-lg font-bold">
            {group.group_image ? (
              <img
                src={group.group_image}
                width="24"
                height="24"
                decoding="async"
                className="h-6 w-6 rounded-sm object-cover object-center"
              />
            ) : (
              <span className="icon-[ri--image-circle-fill] h-6 w-6"></span>
            )}
            <span>{group.group_name}</span>
          </div>
          {group.group_description && (
            <div className="inline-block max-w-full text-xs wrap-break-word whitespace-pre-wrap text-gray-500">
              {group.group_description}
            </div>
          )}
        </div>

        <div className="flex flex-row items-center gap-2 ps-2 pe-4 text-sm">
          <button
            type="button"
            className="group flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-blue-600 transition hover:bg-gray-200"
            onClick={async () => {
              const todo_id = `temp-${Date.now()}`;
              const dummyTodo: DynamicTodoFormValue = {
                // loading: true,
                todo_id,
                // group_id: group.group_id,
                title: '',
                description: '',
                begin_date: '',
                begin_time: '',
                limit_date: '',
                limit_time: '',
                done_at: null,
                order: 0,
                // file_list: [],
                // created_at: new Date(),
                // updated_at: new Date(),
                // created_by: '',
                // updated_by: '',
                // group: group,
              };

              setTodoList((prev) => [dummyTodo, ...prev]);

              try {
                // todo_idで自身を探して置き換え（インデックスの変動に対応）
                const realTodo = await hono.todo.create
                  .$post({
                    json: {
                      group_id: group.group_id,
                      ...dummyTodo,
                    },
                  })
                  .unwrap();

                setTodoList((prev) => {
                  const dummyIndex = prev.findIndex((t) => t.todo_id === dummyTodo.todo_id);
                  return prev.map((x, index) => (index === dummyIndex ? realTodo : x));
                });
              } catch (error) {
                // エラー発生時はダミーを削除
                setTodoList((prev) => {
                  const dummyIndex = prev.findIndex((t) => t.todo_id === dummyTodo.todo_id);
                  return prev.filter((_, index) => index !== dummyIndex);
                });
                throw error;
              }
            }}
          >
            <span className="icon-[icon-park-solid--add-one] h-4 w-4"></span>
            <span className="capitalize">add todo</span>
          </button>

          <div className="flex flex-row items-center gap-2 text-sm">
            <label
              htmlFor={`${group.group_id}-status-active`}
              className="flex items-center font-medium text-gray-900 capitalize"
            >
              <input
                id={`${group.group_id}-status-active`}
                name="todo_status"
                type="radio"
                value="active"
                disabled={loading}
                className="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                defaultChecked={true}
                onChange={() => handleSubmit({ todo_status: 'active' })}
              />
              active
            </label>
            <label
              htmlFor={`${group.group_id}-status-done`}
              className="flex items-center font-medium text-gray-900 capitalize"
            >
              <input
                id={`${group.group_id}-status-done`}
                name="todo_status"
                type="radio"
                value="done"
                disabled={loading}
                className="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                onChange={() => handleSubmit({ todo_status: 'done' })}
              />
              done
            </label>

            <span
              className={cn(
                'icon-[svg-spinners--3-dots-fade] text-opacity-60 h-4 w-4 animate-pulse text-gray-600',
                loading ? '' : 'hidden',
              )}
            />
          </div>
        </div>
      </div>

      <ul ref={todoSortableContainer}>
        {todo_list.map((todo, i) => (
          <DynamicTodoForm
            key={todo.todo_id}
            todo={todo}
            setTodo={(v) => setTodoList((prev) => prev.map((x, index) => (index === i ? v : x)))}
            // modelValueFileList={todo.file_list}
            // onUpdate:modelValueFileList={(v) => (todo_list.value[i]!.file_list = v)}
            space_id={$props.space_id}
            group_id={group.group_id}
            order={i}
            onChangeDoneStatus={() => setTodoList((prev) => prev.filter((_, index) => index !== i))}
          />
        ))}
        {!loading && todo_list.length === 0 && (
          <div className="my-6 w-full text-center">
            <div className="icon-[game-icons--night-sleep] h-12 w-12 bg-green-600 rtl:rotate-180"></div>
            <div className="text-green-600">Nothing ToDo!</div>
          </div>
        )}
      </ul>
    </div>
  );
}
