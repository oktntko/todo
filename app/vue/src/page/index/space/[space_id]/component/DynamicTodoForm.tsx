import { TodoRouterSchema } from '@todo/express/schema';
import { R } from '@todo/lib/remeda';
import { onClickOutside, useVModel } from '@vueuse/core';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref, useTemplateRef, watch } from 'vue';

import type { DownloadFile } from '~/component/MyDownloadFileList.vue';

import MyModalInputFile from '~/component/input/MyModalInputFile.vue';
import MyDropdown, { type MyDropdownSlots } from '~/component/MyDropdown.vue';
import { useFile } from '~/composable/useFile';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export type DynamicTodoModel = Omit<RouterOutput['todo']['get'], 'file_list'> & {
  file_list: DownloadFile[];
  editing?: boolean;
};
type Props = {
  modelValue: DynamicTodoModel;
  modelValueFileList: DownloadFile[];
  space_id: string;
  group_id: string;
  order: number;
};
const props = satisfiesKeys<Props>()(
  'modelValue',
  'modelValueFileList',
  'group_id',
  'order',
  'space_id',
);

const emits = {
  change: () => true,
  'update:modelValue': (_: DynamicTodoModel) => true,
  'update:modelValueFileList': (_: DownloadFile[]) => true,
} satisfies EmitsType;

export default defineComponent(
  ($props: Props, { emit: $emit }) => {
    const $dialog = useDialog();
    const $toast = useToast();

    const modelValue = useVModel($props, 'modelValue', $emit);
    const modelValueFileList = useVModel($props, 'modelValueFileList', $emit);

    const { uploadManyFiles } = useFile();

    const { validate } = useVueValidateZod(TodoRouterSchema.applyChangeInput, modelValue);

    const status = ref<{
      fixedEditing: boolean;
      save: '' | 'saving...' | 'saved!';
    }>({
      fixedEditing: false,
      save: '',
    });
    const debounceResetStatus = R.funnel(() => (status.value.save = ''), {
      minQuietPeriodMs: 1000,
    });

    const handleSubmit = async function () {
      const result = await validate();
      if (!result.success) return;

      const value = result.data;

      try {
        status.value.save = 'saving...';
        const todo = await trpc.todo.applyChange.mutate({
          ...value,
          group_id: $props.group_id,
          order: $props.order,
        });

        modelValue.value.updated_at = todo.updated_at;

        status.value.save = 'saved!';
        debounceResetStatus.call();
      } finally {
        //
      }
    };

    const debounceHandleSubmit = R.funnel(handleSubmit, { minQuietPeriodMs: 500 });
    async function handleInput() {
      // watch だと検索条件を変更したときにwatchが発火してしまう
      // {deep:true} を付けても newとoldの値が一致するので値の変化を取得できない
      // ので @inputイベントを監視して submit を発火する
      debounceHandleSubmit.call();
    }

    watch(
      () => [
        $props.order, // 順番が変わったとき
        modelValue.value.group_id, // ほかのグループに移動したとき
      ],
      () => {
        debounceHandleSubmit.call();
      },
    );

    const refForm = useTemplateRef<HTMLFormElement>('refForm');
    onClickOutside(refForm, () => {
      if (!status.value.fixedEditing) {
        modelValue.value.editing = false;
      }
    });

    return () => (
      <form
        ref="refForm"
        class="relative text-sm"
        autocomplete="off"
        onClick={() => (modelValue.value.editing = true)}
        onSubmit={async (e) => {
          e.preventDefault();
          return handleSubmit();
        }}
      >
        <div
          class={[
            'absolute inset-y-0 left-0 flex items-center justify-center',
            { hidden: !modelValue.value.editing },
          ]}
        >
          <button
            type="button"
            class="todo-handle relative flex cursor-move items-center justify-center"
            title="handle"
          >
            <span class="icon-[radix-icons--drag-handle-dots-2] h-5 w-5"></span>
            <span class="sr-only capitalize">handle</span>
          </button>
        </div>

        <div class="relative flex flex-row gap-2">
          <div class="flex items-start justify-center">
            {status.value.save === '' && modelValue.value.done_at == null && (
              <button
                type="button"
                class="group relative flex cursor-pointer items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-200 hover:text-green-500"
                title="done"
                onClick={async (e) => {
                  e.preventDefault();
                  modelValue.value.done_at = new Date();
                  $emit('change');
                  return handleSubmit();
                }}
              >
                <span class="icon-[material-symbols--circle-outline] group-hover:icon-[material-symbols--check-circle-outline-rounded] h-5 w-5 group-hover:h-5 group-hover:w-5"></span>
                <span class="sr-only capitalize">done</span>
              </button>
            )}

            {status.value.save === '' && modelValue.value.done_at != null && (
              <button
                type="button"
                class="group relative flex cursor-pointer items-center justify-center rounded-full text-green-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                title="active"
                onClick={async (e) => {
                  e.preventDefault();
                  modelValue.value.done_at = null;
                  $emit('change');
                  return handleSubmit();
                }}
              >
                <span class="icon-[material-symbols--check-circle-outline-rounded] group-hover:icon-[material-symbols--circle-outline] h-5 w-5 group-hover:h-5 group-hover:w-5"></span>
                <span class="sr-only capitalize">done</span>
              </button>
            )}

            {status.value.save === 'saving...' && (
              <div
                class="relative flex items-center justify-center rounded-full transition-colors"
                title="status"
              >
                <span class="icon-[eos-icons--bubble-loading] h-5 w-5 text-gray-500"></span>
                <span class="sr-only capitalize">saving</span>
              </div>
            )}

            {status.value.save === 'saved!' && (
              <div
                class="relative flex items-center justify-center rounded-full transition-colors"
                title="status"
              >
                <span class="icon-[bi--brightness-high-fill] h-5 w-5 text-pink-500"></span>
                <span class="sr-only capitalize">saved</span>
              </div>
            )}
          </div>

          <div class="relative flex min-w-0 grow flex-col gap-1.5">
            <div class="relative flex flex-row gap-1">
              <input
                v-model={modelValue.value.title}
                name="title"
                type="text"
                class="block w-full border-b border-b-gray-400 bg-inherit pb-0.5 text-sm font-bold outline-hidden"
                placeholder="Title"
                maxlength="100"
                onInput={handleInput}
              />

              <MyDropdown
                class={[{ hidden: !modelValue.value.editing }]}
                v-slots={
                  {
                    button: ({ toggle }) => (
                      <button
                        type="button"
                        class="relative flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-gray-200"
                        onClick={toggle}
                      >
                        <span class="icon-[bx--menu] h-4 w-4"></span>
                        <span class="sr-only capitalize">menu</span>
                      </button>
                    ),
                    default: () => (
                      <ul class="w-48 rounded-sm border border-gray-300 bg-white shadow-md">
                        <li>
                          <button
                            type="button"
                            class="group flex w-full cursor-pointer items-center p-2 transition duration-75 hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
                            onClick={async () => {
                              status.value.fixedEditing = true;
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
                                    todo_id: modelValue.value.todo_id,
                                  });

                                  modelValueFileList.value = [...modelValueFileList.value, ...data];
                                }
                              } finally {
                                status.value.fixedEditing = false;
                              }
                            }}
                          >
                            <span class="icon-[material-symbols--upload-file] h-4 w-4"></span>
                            <span class="ms-1 capitalize">upload file</span>
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            class="group flex w-full cursor-pointer items-center p-2 text-yellow-600 transition duration-75 hover:bg-gray-200"
                            onClick={async () => {
                              await $dialog.confirm.warn(`Do you really want to delete this data?`);

                              await trpc.todo.delete.mutate(modelValue.value);

                              $emit('change');
                              $toast.success('Todo has been deleted.');
                            }}
                          >
                            <span class="icon-[tabler--trash-filled] h-4 w-4"></span>
                            <span class="ms-1 capitalize">delete todo</span>
                          </button>
                        </li>
                      </ul>
                    ),
                  } satisfies MyDropdownSlots
                }
              />
            </div>

            <div class="flex flex-row items-center justify-start gap-2">
              <div class="flex flex-row gap-2">
                <div>
                  <input
                    id={`${modelValue.value.todo_id}-begin_date`}
                    v-model={modelValue.value.begin_date}
                    name="begin_date"
                    type="date"
                    max="9999-12-31"
                    class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                  />
                </div>
                <div>
                  <input
                    id={`${modelValue.value.todo_id}-begin_time`}
                    v-model={modelValue.value.begin_time}
                    name="begin_time"
                    type="time"
                    class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                  />
                </div>
              </div>
              <div>～</div>
              <div class="flex flex-row gap-2">
                <div>
                  <input
                    id={`${modelValue.value.todo_id}-limit_date`}
                    v-model={modelValue.value.limit_date}
                    name="limit_date"
                    type="date"
                    max="9999-12-31"
                    class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                  />
                </div>
                <div>
                  <input
                    id={`${modelValue.value.todo_id}-limit_time`}
                    v-model={modelValue.value.limit_time}
                    name="limit_time"
                    type="time"
                    class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                    onInput={handleInput}
                  />
                </div>
              </div>
            </div>

            <div class="text-xs">
              <textarea
                id={`${modelValue.value.todo_id}-description`}
                v-model={modelValue.value.description}
                class="block field-sizing-content w-full border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden"
                placeholder="Description"
                onInput={handleInput}
              ></textarea>
            </div>
          </div>
        </div>
      </form>
    );
  },
  {
    props,
    emits,
  },
);
