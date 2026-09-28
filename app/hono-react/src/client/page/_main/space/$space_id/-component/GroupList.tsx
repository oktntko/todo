import type { InferResponseType } from 'hono';

import { R } from '@todo/lib';
import { useAtom } from 'jotai';
import { useEffect, useEffectEvent, useRef, type Dispatch, type SetStateAction } from 'react';
import Sortable from 'sortablejs';

import { cn } from '~/lib/cn';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { groupListAtom } from '~/store/GroupStore';

import { ModalAddGroup } from '../-modal/ModalAddGroup';
import { ModalEditGroup } from '../-modal/ModalEditGroup';

export type GroupListType = InferResponseType<typeof hono.group.list.$post>;

type GroupListProps = {
  checkedGroupList: GroupListType;
  setCheckedGroupList: Dispatch<SetStateAction<GroupListType>>;
  space_id: string;
  type: 'checkbox' | 'radio';
  className?: string;
};

export function GroupList({
  checkedGroupList,
  setCheckedGroupList,
  className,
  ...$props
}: GroupListProps) {
  const $toast = useToast();
  const $dialog = useDialog();

  const [groupList, setGroupList] = useAtom(groupListAtom);

  const sortable = useRef<Sortable | null>(null);
  const groupSortableContainer = useRef<HTMLUListElement | null>(null);
  const handleSortEnd = useEffectEvent((e: Sortable.SortableEvent) => {
    if (e.from !== e.to) {
      return;
    }
    if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
      return;
    }

    const group = groupList[e.oldIndex]!;
    const reorderedGroupList = groupList.toSpliced(e.oldIndex, 1).toSpliced(e.newIndex, 0, group);

    const nextGroupList = reorderedGroupList.map((x, i) => ({
      ...x,
      group_order: i,
    }));

    setGroupList(nextGroupList);

    setCheckedGroupList(
      nextGroupList.filter((x) => checkedGroupList.find((y) => y.group_id === x.group_id)),
    );

    void hono.group.reorder
      .$post({
        json: {
          space_id: $props.space_id,
          order: nextGroupList,
        },
      })
      .then(() => {
        $toast.success('Reordered successfully');
      });
  });

  useEffect(() => {
    const container = groupSortableContainer.current;
    if (!container) {
      return;
    }

    const sortableInstance = Sortable.create(container, {
      animation: 150,
      group: 'group',
      onEnd: handleSortEnd,
    });
    sortable.current = sortableInstance;

    return () => {
      sortableInstance.destroy();
      sortable.current = null;
    };
  }, []);

  return (
    <aside className={cn('flex flex-col gap-2', className)}>
      <h1 className="flex items-center gap-1 text-xs text-gray-500">
        <span className="capitalize">group</span>
      </h1>

      <div>
        <ul ref={groupSortableContainer} className="text-sm">
          {groupList.map((group) => (
            <li key={group.group_id} className="rounded-e-full py-px">
              <label
                className={cn(
                  'group/item relative flex w-full cursor-pointer items-center justify-start gap-1 rounded-e-full border-l-[6px] p-1 transition hover:bg-gray-200',
                  {
                    'bg-gray-300': ~checkedGroupList.findIndex(
                      (x) => x.group_id === group.group_id,
                    ),
                  },
                )}
                style={{
                  borderLeftColor: group.group_color,
                }}
              >
                <input
                  name="group"
                  type={$props.type}
                  className="sr-only"
                  checked={checkedGroupList.includes(group)}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    if ($props.type === 'radio') {
                      if (checked) {
                        setCheckedGroupList([group]);
                      }
                    } else {
                      if (checked && !checkedGroupList.includes(group)) {
                        setCheckedGroupList((prev) =>
                          R.sortBy([...prev, group], (x) => x.group_order),
                        );
                      } else if (!checked && checkedGroupList.includes(group)) {
                        setCheckedGroupList((prev) =>
                          prev.filter((x) => x.group_id !== group.group_id),
                        );
                      }
                    }
                  }}
                />
                {group.group_image ? (
                  <img
                    src={group.group_image}
                    width="16"
                    height="16"
                    decoding="async"
                    className="h-4 w-4 shrink-0 rounded-sm object-cover object-center"
                  />
                ) : (
                  <span className="icon-[ri--image-circle-fill] h-4 w-4 shrink-0"></span>
                )}

                <span className="shrink grow truncate">{group.group_name}</span>
                <button
                  type="button"
                  className={cn(
                    'group/edit inline-flex justify-center rounded-full p-1 transition-all',
                    'opacity-0 group-hover/item:opacity-100',
                    'hover:bg-gray-300',
                  )}
                  onClick={async (e) => {
                    e.preventDefault();

                    await $dialog.showModal({
                      Component: ModalEditGroup,
                      $props: (resolve) => ({
                        group,
                        onDone: resolve,
                      }),
                    });

                    setCheckedGroupList(
                      groupList.filter((x) =>
                        checkedGroupList.find((y) => y.group_id === x.group_id),
                      ),
                    );
                  }}
                >
                  <span
                    className={cn(
                      'icon-[bx--menu] h-4 w-4 shrink-0 transition-all',
                      'group-hover/edit:scale-125 group-hover/edit:text-gray-900',
                    )}
                  ></span>
                </button>
              </label>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="group sticky bottom-0 flex w-full cursor-pointer items-center gap-1 rounded-e-full bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition hover:bg-gray-200"
          onClick={async () => {
            await $dialog.showModal({
              Component: ModalAddGroup,
              $props: (resolve) => ({
                space_id: $props.space_id,
                onDone: resolve,
              }),
            });
          }}
        >
          <span className="icon-[icon-park-solid--add-one] h-4 w-4"></span>
          <span className="capitalize">create new group</span>
        </button>
      </div>
    </aside>
  );
}
