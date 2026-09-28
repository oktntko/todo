import { zodResolver } from '@hookform/resolvers/zod';
import { R, z } from '@todo/lib';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { TodoRouterSchema } from '@/schema';
import { cn } from '~/lib/cn';
import { hono } from '~/middleware/hono';

export type DynamicTodoFormValue = Omit<
  z.input<typeof TodoRouterSchema.applyChangeInput>,
  'group_id'
>;

type DynamicTodoFormProps = {
  space_id: string;
  group_id: string;
  order: number;
  todo: DynamicTodoFormValue;
  setTodo: (todo: DynamicTodoFormValue) => void;
  onChangeDoneStatus: () => void;
};

export function DynamicTodoForm({
  space_id,
  group_id,
  order,
  todo,
  setTodo,
  onChangeDoneStatus,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement> & DynamicTodoFormProps) {
  const [loading, _setLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState<'' | 'editing' | 'fixed'>('');

  const debounceHandleSubmit = R.funnel(handleSubmit, { minQuietPeriodMs: 500 });
  async function handleInput() {
    // watch だと検索条件を変更したときにwatchが発火してしまう
    // {deep:true} を付けても newとoldの値が一致するので値の変化を取得できない
    // ので @inputイベントを監視して submit を発火する
    debounceHandleSubmit.call();
  }

  const methods = useForm<DynamicTodoFormValue>({
    defaultValues: todo,
    resolver: zodResolver(
      TodoRouterSchema.applyChangeInput.omit({
        group_id: true,
      }),
    ),
  });

  async function handleSubmit({ done_at }: { done_at?: string | Date | null | undefined } = {}) {
    const ok = await methods.trigger();
    if (!ok) return;

    const value = methods.getValues();

    const updatedTodo = await hono.todo.applyChange
      .$post({
        json: {
          ...value,
          group_id,
          order,
          done_at: done_at === undefined ? value.done_at : done_at,
        },
      })
      .unwrap();

    setTodo(updatedTodo);
  }

  // TODO: 初回マウント時も実行されるので、
  // active ⇔ done を変更すると無限ループする
  // useEffect(() => {
  //   debounceHandleSubmit.call();
  //   // oxlint-disable-next-line react-hooks/exhaustive-deps
  // }, [order, group_id]);

  const refForm = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    function onClickOutside(event: PointerEvent) {
      const thisForm = refForm.current;
      const isInside = thisForm?.contains(event.target as Node | null);

      if (!isInside && editingStatus !== 'fixed') {
        setEditingStatus('');
      }
    }

    document.addEventListener('click', onClickOutside);

    return () => {
      document.removeEventListener('click', onClickOutside);
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <li
      className={cn(
        'transition-colors',
        editingStatus !== '' ? 'bg-blue-100' : 'hover:bg-gray-100',
      )}
    >
      <form
        {...props}
        ref={refForm}
        className={cn(
          'px-4 pt-2 pb-4 group/item relative text-sm',
          loading ? 'pointer-events-none opacity-60' : '',
        )}
        autoComplete="off"
        onClick={() => {
          if (!loading) {
            setEditingStatus('editing');
          }
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          return handleSubmit();
        }}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-center transition-all transition-discrete',
            editingStatus === 'editing' ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <button
            type="button"
            className="todo-handle relative flex cursor-move items-center justify-center"
            title="handle"
          >
            <span className="icon-[radix-icons--drag-handle-dots-2] h-5 w-5"></span>
            <span className="sr-only capitalize">handle</span>
          </button>
        </div>

        <div className="relative flex flex-row gap-2">
          <div className="flex items-start justify-center">
            {todo.done_at == null && (
              <button
                type="button"
                className="group relative flex cursor-pointer items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-200 hover:text-green-500"
                title="done"
                onClick={async (e) => {
                  e.preventDefault();
                  return handleSubmit({ done_at: new Date() }).then(onChangeDoneStatus);
                }}
              >
                <span className="icon-[material-symbols--circle-outline] group-hover:icon-[material-symbols--check-circle-outline-rounded] h-5 w-5 group-hover:h-5 group-hover:w-5"></span>
                <span className="sr-only capitalize">done</span>
              </button>
            )}

            {todo.done_at != null && (
              <button
                type="button"
                className="group relative flex cursor-pointer items-center justify-center rounded-full text-green-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                title="active"
                onClick={async (e) => {
                  e.preventDefault();
                  return handleSubmit({ done_at: null }).then(onChangeDoneStatus);
                }}
              >
                <span className="icon-[material-symbols--check-circle-outline-rounded] group-hover:icon-[material-symbols--circle-outline] h-5 w-5 group-hover:h-5 group-hover:w-5"></span>
                <span className="sr-only capitalize">done</span>
              </button>
            )}
          </div>

          <div className="relative flex min-w-0 grow flex-col gap-1.5">
            <div className="relative flex flex-row gap-1">
              <input
                type="text"
                disabled={loading}
                className="block w-full border-b border-b-gray-400 bg-inherit pb-0.5 text-sm font-bold outline-hidden"
                placeholder="Title"
                maxLength={100}
                onInput={handleInput}
                {...methods.register('title')}
              />

              {/* <MyDropdown
              className={cn(
                'opacity-0 transition-all transition-discrete group-hover/item:inline-block group-hover/item:opacity-100',
                { 'inline-block! opacity-100!': editing },
              )}
              v-slots={
                {
                  button: ({ toggle }) => (
                    <button
                      type="button"
                      className={[
                        'group/edit inline-flex justify-center rounded-full transition-all',
                        'opacity-0 group-hover/item:opacity-100',
                      ]}
                      onClick={toggle}
                    >
                      <span
                        className={[
                          'icon-[bx--menu] h-4 w-4 shrink-0 transition-all',
                          'group-hover/edit:scale-125 group-hover/edit:text-gray-900',
                        ]}
                      ></span>
                      <span className="sr-only capitalize">menu</span>
                    </button>
                  ),
                  default: () => (
                    <ul className="w-48 rounded-sm border border-gray-300 bg-white shadow-md">
                      <li>
                        <button
                          type="button"
                          className="group flex w-full cursor-pointer items-center gap-1 p-2 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
                          onClick={async () => {
                            status.fixedEditing = true;
                            try {
                              await $dialog.showModal(ModalAddNotification, (resolve) => ({
                                todo_id: todo_id,
                                onDone: resolve,
                              }));
                            } finally {
                              status.fixedEditing = false;
                            }
                          }}
                        >
                          <span className="icon-[ion--notifcations] h-4 w-4"></span>
                          <span className="capitalize">notify later</span>
                        </button>
                      </li>

                      <li>
                        <button
                          type="button"
                          className="group flex w-full cursor-pointer items-center gap-1 p-2 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
                          onClick={async () => {
                            status.fixedEditing = true;
                            try {
                              const files: File[] = await $dialog.showModal(
                                MyModalInputFile,
                                (resolve) => ({
                                  multiple: true,
                                  onDone: resolve,
                                }),
                              );

                              if (files.length > 0) {
                                const { data } = await uploadManyFiles(files, {
                                  space_id: $props.space_id,
                                  todo_id: todo_id,
                                });

                                modelValueFileList.value = [...modelValueFileList.value, ...data];
                              }
                            } finally {
                              status.fixedEditing = false;
                            }
                          }}
                        >
                          <span className="icon-[material-symbols--upload-file] h-4 w-4"></span>
                          <span className="capitalize">upload file</span>
                        </button>
                      </li>

                      <li>
                        <button
                          type="button"
                          className="group flex w-full cursor-pointer items-center gap-1 p-2 text-yellow-600 transition hover:bg-gray-200"
                          onClick={async () => {
                            await $dialog.confirm.warn(`Do you really want to delete this data?`);

                            await trpc.todo.delete.mutate(modelValue);

                            $emit('change');
                            $toast.success('Todo has been deleted.');
                          }}
                        >
                          <span className="icon-[tabler--trash-filled] h-4 w-4"></span>
                          <span className="capitalize">delete todo</span>
                        </button>
                      </li>
                    </ul>
                  ),
                } satisfies MyDropdownSlots
              }
            /> */}
            </div>

            <div className="flex flex-row items-center justify-start gap-2">
              <div className="flex flex-row gap-2">
                <div>
                  <input
                    id={`${todo.todo_id}-begin_date`}
                    type="date"
                    disabled={loading}
                    max="9999-12-31"
                    className="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                    {...methods.register('begin_date')}
                  />
                </div>
                <div>
                  <input
                    id={`${todo.todo_id}-begin_time`}
                    type="time"
                    disabled={loading}
                    className="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                    {...methods.register('begin_time')}
                  />
                </div>
              </div>
              <div>～</div>
              <div className="flex flex-row gap-2">
                <div>
                  <input
                    id={`${todo.todo_id}-limit_date`}
                    type="date"
                    disabled={loading}
                    max="9999-12-31"
                    className="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                    {...methods.register('limit_date')}
                  />
                </div>
                <div>
                  <input
                    id={`${todo.todo_id}-limit_time`}
                    type="time"
                    disabled={loading}
                    className="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                    {...methods.register('limit_time')}
                  />
                </div>
              </div>
            </div>

            <div className="text-xs">
              <textarea
                id={`${todo.todo_id}-description`}
                disabled={loading}
                className="block field-sizing-content w-full border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden"
                placeholder="Description"
                onInput={handleInput}
                {...methods.register('description')}
              ></textarea>
            </div>
          </div>
        </div>
      </form>
    </li>
  );
}
