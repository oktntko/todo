import { createFileRoute, useParams } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import { cn } from '~/lib/cn';
import { groupListAtom } from '~/store/GroupStore';

import { Group } from './-component/Group';
import { GroupList, type GroupListType } from './-component/GroupList';

export const Route = createFileRoute('/_main/space/$space_id/list')({
  component: function Page() {
    const $params = useParams({ from: '/_main/space/$space_id/list' });

    const groupList = useAtomValue(groupListAtom);
    const [checkedGroupList, setCheckedGroupList] = useState<GroupListType>(
      groupList[0] ? [groupList[0]] : [],
    );

    return (
      <div className="flex flex-row">
        <GroupList
          checkedGroupList={checkedGroupList}
          setCheckedGroupList={setCheckedGroupList}
          space_id={$params.space_id}
          className="h-[calc(100vh-64px)] w-56 shrink-0 overflow-y-auto px-2"
          type="radio"
        />

        {/*
      w-[calc(100vw-224px-224px-10px)]
      224px: グローバルメニュー
      224px: GroupList
      */}
        <div
          className={cn(
            'h-[calc(100vh-64px)] w-[calc(100vw-224px-224px)] grow-0 overflow-x-auto px-4 pb-4',
            'pr-56',
          )}
        >
          <div className="flex h-full w-full flex-row gap-2">
            {checkedGroupList.map((group) => (
              <div
                key={group.group_id}
                className={cn('shrink-0 break-inside-avoid', 'mx-auto w-2xl')}
              >
                <Group
                  space_id={$params.space_id}
                  group={group}
                  className="max-h-full overflow-y-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
