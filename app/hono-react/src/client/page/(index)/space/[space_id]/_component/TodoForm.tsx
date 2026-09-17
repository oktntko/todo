import type { ReactNode, SubmitEventHandler } from 'react';

import { useFormContext } from 'react-hook-form';

import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyInput } from '~/component/input/MyInput';
import { MySelect } from '~/component/input/MySelect';
import { MyTextarea } from '~/component/input/MyTextarea';
import { useGroupStore } from '~/store/GroupStore';

import type { TodoFormValue } from './useTodoForm';

type Props = {
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  buttons?: ReactNode;
};

export function TodoForm({ onSubmit, buttons }: Props) {
  const { groupList } = useGroupStore();

  const {
    register,
    formState: { errors, isDirty },
  } = useFormContext<TodoFormValue>();

  return (
    <form className="flex flex-col gap-6" autoComplete="off" onSubmit={onSubmit}>
      <section className="flex flex-col gap-3">
        <div className="focus-container flex flex-col gap-0.5">
          <div>
            <label htmlFor="group_id" className="required text-sm capitalize">
              group
            </label>
          </div>

          <div>
            <MySelect id="group_id" className="flex min-w-60" {...register('group_id')}>
              <option value="" disabled>
                -- Select Group --
              </option>
              {groupList.map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.group_name}
                </option>
              ))}
            </MySelect>
          </div>

          <ErrorMessage>{errors.group_id?.message}</ErrorMessage>
        </div>

        <div className="focus-container flex flex-col gap-0.5">
          <div>
            <label htmlFor="title" className="optional text-sm capitalize">
              title
            </label>
          </div>

          <div>
            <MyInput id="title" type="text" className="w-full" {...register('title')} />
          </div>

          <ErrorMessage>{errors.title?.message}</ErrorMessage>
        </div>

        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-0.5">
            <div>
              <label htmlFor="begin_date" className="optional text-sm capitalize">
                begin
              </label>
            </div>

            <div className="flex flex-row gap-2">
              <MyInput id="begin_date" type="date" max="9999-12-31" {...register('begin_date')} />
              <MyInput id="begin_time" type="time" {...register('begin_time')} />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="invisible text-sm">～</div>
            <div className="flex grow items-center">～</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div>
              <label htmlFor="limit_date" className="optional text-sm capitalize">
                limit
              </label>
            </div>

            <div className="flex flex-row gap-2">
              <MyInput id="limit_date" type="date" max="9999-12-31" {...register('limit_date')} />
              <MyInput id="limit_time" type="time" {...register('limit_time')} />
            </div>
          </div>
        </div>

        <div className="focus-container flex flex-col gap-0.5">
          <div>
            <label htmlFor="description" className="optional text-sm capitalize">
              description
            </label>
          </div>

          <div>
            <MyTextarea
              id="description"
              className="w-full"
              rows={4}
              {...register('description')}
            ></MyTextarea>
          </div>

          <ErrorMessage>{errors.description?.message}</ErrorMessage>
        </div>

        {/* <div className="flex flex-col gap-0.5">
          <div>
            <label htmlFor="file" className="inline-flex items-center gap-2 text-sm capitalize">
              files
              <button
                id="file"
                type="button"
                className={cn(
                  'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
                  'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
                  'rounded-3xl border p-1',
                  'button-white secondary',
                )}
                disabled={!props.todo_id}
                onClick={async () => {
                  const files: File[] = await $dialog.showModal(MyModalInputFile, (resolve) => ({
                    multiple: true,
                    onDone: resolve,
                  }));

                  if (files.length > 0) {
                    const { data } = await uploadManyFiles(files, {
                      space_id: props.space_id,
                      todo_id: props.todo_id,
                    });

                    modelValueFileList.value = [...modelValueFileList.value, ...data];
                  }
                }}
              >
                <span className="icon-[heroicons-outline--paper-clip] h-4 w-4"></span>
              </button>
            </label>
          </div>
          <MyDownloadFileList
            modelValueFileList={modelValueFileList.value}
            onUpdate:modelValueFileList={(v: DownloadFile[]) => (modelValueFileList.value = v)}
          ></MyDownloadFileList>
        </div> */}
      </section>

      <section className="flex gap-2">
        <MyButton type="submit" disabled={!isDirty} color="green" variant="contained">
          <span className="capitalize">save</span>
        </MyButton>

        {buttons}
      </section>
    </form>
  );
}
