import { R } from '@todo/lib/remeda';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';

import { useDialog } from '~/plugin/DialogPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

import ModalAddSpace from './[space_id]/modal/ModalAddSpace';

export default defineComponent(() => {
  const $dialog = useDialog();

  const { storedSpaceList } = storeToRefs(useSpaceStore());

  return () => (
    <div class="container mx-auto flex max-w-5xl flex-col gap-2">
      <div class="grid grid-cols-3 gap-4">
        {storedSpaceList.value.map((space) => (
          <RouterLink
            to={{
              name: '//space/[space_id]/',
              params: {
                space_id: space.space_id,
              },
            }}
            class={[
              'group/item relative flex w-full cursor-pointer items-center justify-start gap-1 rounded-md border-l-[6px] bg-white px-1 py-2 shadow transition hover:bg-gray-200',
            ]}
            style={{
              'border-left-color': space.space_color,
            }}
          >
            <div class="flex min-w-0 flex-row gap-2">
              <div class="flex shrink-0 items-center">
                {space.space_image ? (
                  <img
                    src={space.space_image}
                    width="48"
                    height="48"
                    decoding="async"
                    class="h-12 w-12 shrink-0 rounded-full object-cover object-center"
                  />
                ) : (
                  <span class="icon-[ri--image-circle-fill] h-12 w-12 shrink-0"></span>
                )}
              </div>

              <div class="flex min-w-0 flex-col gap-1">
                <div class="truncate">{space.space_name}</div>

                <div class="flex items-center gap-1">
                  {R.pipe(space.space_user_list[0].role, (role) => (
                    <div
                      class={[
                        'rounded-md px-1 py-0.5 text-xs font-medium',
                        role === 'OWNER'
                          ? 'border-green-600 bg-green-100 text-green-600'
                          : role === 'ADMIN'
                            ? 'border-red-600 bg-red-100 text-red-600'
                            : role === 'EDITOR'
                              ? 'border-blue-600 bg-blue-100 text-blue-600'
                              : role === 'READER'
                                ? 'border-gray-600 bg-gray-100 text-gray-900'
                                : '',
                      ]}
                    >
                      {role}
                    </div>
                  ))}

                  <div
                    title={space.space_description}
                    class="line-clamp-1 text-xs wrap-break-word whitespace-pre-wrap text-gray-500"
                  >
                    {space.space_description}
                  </div>
                </div>
              </div>
            </div>
          </RouterLink>
        ))}
      </div>

      <div class="sticky bottom-0">
        <button
          type="button"
          class="group inline-flex items-center gap-1 rounded bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition-[color,text-shadow] hover:text-blue-800 hover:text-shadow-sm"
          onClick={async () => {
            await $dialog.showModal(ModalAddSpace, (resolve) => ({
              onDone: resolve,
            }));
          }}
        >
          <span class="icon-[icon-park-solid--add-one] h-4 w-4" />
          <span class="capitalize">create new space</span>
        </button>
      </div>
    </div>
  );
});
