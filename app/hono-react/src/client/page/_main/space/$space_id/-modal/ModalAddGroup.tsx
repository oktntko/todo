import type { InferResponseType } from 'hono';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';

import { GroupRouterSchema } from '@/schema';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { groupListAtom } from '~/store/GroupStore';

import type { GroupFormValue } from '../-component/useGroupForm';

import { GroupForm } from '../-component/GroupForm';

type ModalAddGroupProps = {
  space_id: string;
  onDone: (group: InferResponseType<typeof hono.group.create.$post>) => void;
};

export function ModalAddGroup($props: ModalAddGroupProps) {
  const $dialog = useDialog();
  const $toast = useToast();

  const setGroupList = useSetAtom(groupListAtom);

  const methods = useForm<GroupFormValue>({
    defaultValues: {
      space_id: $props.space_id,
      group_name: '',
      group_description: '',
      group_image: '',
      group_color: '#FFFFFF',
    },
    resolver: zodResolver(GroupRouterSchema.createInput),
  });

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      const group = await hono.group.create.$post({ json: value }).unwrap();

      setGroupList((prev) => {
        return [...prev, group];
      });

      $toast.success('Data has been saved.');

      $props.onDone(group);
    } finally {
      loading.close();
    }
  });

  return (
    <div className="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
      <header className="mb-4 text-lg font-bold capitalize">create new group</header>

      <FormProvider {...methods}>
        <GroupForm onSubmit={handleSubmit} />
      </FormProvider>
    </div>
  );
}
