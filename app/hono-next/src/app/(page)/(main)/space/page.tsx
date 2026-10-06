'use client';

import { R } from '@todo/lib';
import Link from 'next/link';

import { useMainState } from '@/(main)/component/MainState/useMainState';
import { useDialog } from '@/plugin/useDialog';
import { cn } from '~/lib/cn';

import { ModalAddSpace } from './component/ModalAddSpace';

export default function Page() {
  const $dialog = useDialog();
  const { space_list } = useMainState();

  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-2">
      <div className="grid grid-cols-3 gap-4">
        {space_list.map((space) => (
          <Link
            key={space.space_id}
            href={`/space/${space.space_id}`}
            className={cn(
              'group/item relative flex w-full cursor-pointer items-center justify-start gap-1 rounded-md border-l-[6px] bg-white px-1 py-2 shadow transition hover:bg-gray-200',
            )}
            style={{
              borderLeftColor: space.space_color,
            }}
          >
            <div className="flex min-w-0 flex-row gap-2">
              <div className="flex shrink-0 items-center">
                {space.space_image ? (
                  // oxlint-disable-next-line next/no-img-element
                  <img
                    src={space.space_image}
                    width="48"
                    height="48"
                    decoding="async"
                    className="h-12 w-12 shrink-0 rounded-full object-cover object-center"
                  />
                ) : (
                  <span className="icon-[ri--image-circle-fill] h-12 w-12 shrink-0"></span>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <div className="truncate">{space.space_name}</div>

                <div className="flex items-center gap-1">
                  {R.pipe(space.space_user_list[0].role, (role) => (
                    <div
                      className={cn(
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
                      )}
                    >
                      {role}
                    </div>
                  ))}

                  <div
                    title={space.space_description}
                    className="line-clamp-1 text-xs wrap-break-word whitespace-pre-wrap text-gray-500"
                  >
                    {space.space_description}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="sticky bottom-0">
        <button
          type="button"
          className="group inline-flex items-center gap-1 rounded bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition-[color,text-shadow] hover:text-blue-800 hover:text-shadow-sm"
          onClick={async () => {
            await $dialog.showModal({
              Component: ModalAddSpace,
              $props: (resolve) => ({
                onDone: resolve,
              }),
            });
          }}
        >
          <span className="icon-[icon-park-solid--add-one] h-4 w-4" />
          <span className="capitalize">create new space</span>
        </button>
      </div>
    </div>
  );
}
