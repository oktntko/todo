import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

import type { RouterOutput } from '~/lib/trpc';

import { useGroupStore } from '~/store/GroupStore';

import Group from '../component/Group.tsx';
import GroupList from '../component/GroupList.tsx';

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]/todo/list');

  const { storedGroupList } = storeToRefs(useGroupStore());
  const checkedGroupList = ref<RouterOutput['group']['list']>(
    storedGroupList.value[0] ? [storedGroupList.value[0]] : [],
  );

  return () => (
    <div class="flex flex-row">
      <GroupList
        modelValue={checkedGroupList.value}
        onUpdate:modelValue={(v) => (checkedGroupList.value = v)}
        space_id={$route.params.space_id}
        class="h-[calc(100vh-64px)] w-56 shrink-0 overflow-y-auto px-2"
        type="radio"
      ></GroupList>

      {/*
      w-[calc(100vw-224px-224px-10px)]
      224px: グローバルメニュー
      224px: GroupList
      */}
      <div
        class={[
          'h-[calc(100vh-64px)] w-[calc(100vw-224px-224px)] grow-0 overflow-x-auto px-4 pb-4',
          'pr-56',
        ]}
      >
        <div class="flex h-full w-full flex-row gap-2">
          {checkedGroupList.value.map((group) => (
            <div key={group.group_id} class={['shrink-0 break-inside-avoid', 'mx-auto w-2xl']}>
              <Group
                group={group}
                space_id={$route.params.space_id}
                class="max-h-full overflow-y-auto"
              ></Group>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
