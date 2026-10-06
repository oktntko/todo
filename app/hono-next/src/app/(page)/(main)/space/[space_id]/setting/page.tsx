'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';

import { useMainState } from '@/(main)/component/MainState/useMainState';
import { SpaceForm } from '@/(main)/space/component/SpaceForm';
import type { SpaceFormValue } from '@/(main)/space/component/useSpaceForm';
import { MyLoading } from '@/component/MyLoading';
import { hono } from '@/middleware/hono';
import { useDialog } from '@/plugin/useDialog';
import { useToast } from '@/plugin/useToast';
import { SpaceRouterSchema } from '~/schema';

export default function Page() {
  const { space_id } = useParams<{ space_id: string }>();

  const $dialog = useDialog();
  const $toast = useToast();

  const { space_list, setSpaceList } = useMainState();
  const currentSpace = space_list.find((x) => x.space_id === space_id);

  const methods = useForm<SpaceFormValue>({
    values: currentSpace,
    resolver: zodResolver(SpaceRouterSchema.createInput),
  });

  if (currentSpace == null) {
    return <MyLoading />;
  }

  const handleSubmit = methods.handleSubmit(async function (value) {
    const loading = $dialog.loading();
    try {
      const space = await hono.space.update
        .$post({
          json: {
            ...value,
            space_id,
            updated_at: currentSpace!.updated_at,
          },
        })
        .unwrap();

      setSpaceList((prev) => {
        return prev.map((x) => (x.space_id === space.space_id ? space : x));
      });

      $toast.success('Data has been saved.');
    } finally {
      loading.close();
    }
  });

  return (
    <FormProvider {...methods}>
      <SpaceForm onSubmit={handleSubmit} />
    </FormProvider>
  );
}
