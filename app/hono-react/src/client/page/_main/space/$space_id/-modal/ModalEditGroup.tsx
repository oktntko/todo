import type { InferResponseType } from 'hono';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';

import { GroupRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { groupListAtom } from '~/store/GroupStore';

import type { GroupFormValue } from '../-component/useGroupForm';

import { GroupForm } from '../-component/GroupForm';

type ModalEditGroupProps = {
  group: InferResponseType<typeof hono.group.list.$post>[number];
  onDone: (group: InferResponseType<typeof hono.group.create.$post>) => void;
};

export function ModalEditGroup({ group, ...props }: ModalEditGroupProps) {
  const $dialog = useDialog();
  const $toast = useToast();

  const setGroupList = useSetAtom(groupListAtom);

  const methods = useForm<GroupFormValue>({
    defaultValues: group,
    resolver: zodResolver(GroupRouterSchema.createInput),
  });

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      const updatedGroup = await hono.group.update
        .$post({
          json: {
            ...value,
            group_id: group.group_id,
            updated_at: group.updated_at,
          },
        })
        .unwrap();

      setGroupList((prev) => {
        return prev.map((x) => (x.group_id === updatedGroup.group_id ? updatedGroup : x));
      });

      $toast.success('Data has been saved.');

      props.onDone(group);
    } finally {
      loading.close();
    }
  });

  return (
    <div className="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
      <header className="mb-4 text-lg font-bold capitalize">create new group</header>

      <FormProvider {...methods}>
        <GroupForm
          onSubmit={handleSubmit}
          buttons={
            <MyButton
              type="button"
              color="yellow"
              variant="outlined"
              onClick={async () => {
                await $dialog.confirm.warn(`Do you really want to delete this data?`);

                const loading = $dialog.loading();
                try {
                  const _ = await hono.group.delete
                    .$post({
                      json: {
                        group_id: group.group_id,
                        updated_at: group.updated_at,
                      },
                    })
                    .unwrap();

                  setGroupList((prev) => prev.filter((x) => x.group_id !== group.group_id));

                  $toast.success('Data has been deleted.');

                  props.onDone(group);
                } finally {
                  loading.close();
                }
              }}
            >
              <span className="capitalize">delete</span>
            </MyButton>
          }
        />
      </FormProvider>
    </div>
  );
}
