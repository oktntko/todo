import { zodResolver } from '@hookform/resolvers/zod';
import type { InferResponseType } from 'hono';
import { FormProvider, useForm } from 'react-hook-form';

import { hono } from '@/middleware/hono';
import { useDialog } from '@/plugin/useDialog';
import { useToast } from '@/plugin/useToast';
import { SpaceRouterSchema } from '~/schema';

import { useMainState } from './MainLayout/useMainState';
import { SpaceForm } from './SpaceForm';
import type { SpaceFormValue } from './useSpaceForm';

type ModalAddSpaceProps = {
  onDone: (space: InferResponseType<typeof hono.space.create.$post>) => void;
};

export function ModalAddSpace(props: ModalAddSpaceProps) {
  const $dialog = useDialog();
  const $toast = useToast();

  const { setSpaceList } = useMainState();

  const methods = useForm<SpaceFormValue>({
    defaultValues: {
      space_name: '',
      space_description: '',
      space_image: '',
      space_color: '#FFFFFF',
    },
    resolver: zodResolver(SpaceRouterSchema.createInput),
  });

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      const space = await hono.space.create.$post({ json: value }).unwrap();

      setSpaceList((prev) => {
        return [...prev, space];
      });

      $toast.success('Data has been saved.');

      props.onDone(space);
    } finally {
      loading.close();
    }
  });

  return (
    <div className="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
      <header className="mb-4 text-lg font-bold capitalize">create new space</header>

      <FormProvider {...methods}>
        <SpaceForm onSubmit={handleSubmit} />
      </FormProvider>
    </div>
  );
}
