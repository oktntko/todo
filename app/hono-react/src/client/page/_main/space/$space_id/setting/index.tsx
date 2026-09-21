import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useAtom, useSetAtom } from 'jotai';
import { FormProvider, useForm } from 'react-hook-form';

import { SpaceRouterSchema } from '@/schema';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { currentSpaceAtom, spaceListAtom } from '~/store/SpaceStore';

import type { SpaceFormValue } from '../-component/useSpaceForm';

import { SpaceForm } from '../-component/SpaceForm';

export const Route = createFileRoute('/_main/space/$space_id/setting/')({
  component: function Page() {
    const $params = useParams({ from: '/_main/space/$space_id/setting/' });
    const $dialog = useDialog();
    const $toast = useToast();

    const setSpaceList = useSetAtom(spaceListAtom);
    const [currentSpace, setCurrentSpace] = useAtom(currentSpaceAtom);

    const methods = useForm<SpaceFormValue>({
      values: {
        ...currentSpace!,
      },
      resolver: zodResolver(SpaceRouterSchema.createInput),
    });

    const handleSubmit = methods.handleSubmit(async function (value) {
      const loading = $dialog.loading();
      try {
        const space = await hono.space.update
          .$post({
            json: {
              ...value,
              space_id: $params.space_id,
              updated_at: currentSpace!.updated_at,
            },
          })
          .unwrap();

        setSpaceList((prev) => {
          return prev.map((x) => (x.space_id === space.space_id ? space : x));
        });
        setCurrentSpace(space);

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
  },
});
