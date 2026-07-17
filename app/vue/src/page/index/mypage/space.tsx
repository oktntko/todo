import { R } from '@todo/lib/remeda';
import { storeToRefs } from 'pinia';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

export default defineComponent(() => {
  const $router = useRouter();
  const $dialog = useDialog();
  const $toast = useToast();

  const { storedSpaceList } = storeToRefs(useSpaceStore());

  return () => (
    <div class="flex flex-col gap-6">
      <section class="flex flex-col gap-2">
        {storedSpaceList.value.map((space) => (
          <div
            class={[
              'group/item relative flex w-full cursor-pointer items-center justify-start gap-1 border-l-[6px] px-1 py-2 transition hover:bg-gray-200',
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
          </div>
        ))}
      </section>
    </div>
  );
});
