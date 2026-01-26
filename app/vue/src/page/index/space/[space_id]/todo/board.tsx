import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGroupStore } from '~/store/GroupStore';
import type { DynamicTodoModel } from '../component/DynamicTodoForm.tsx';
import Group from '../component/Group.tsx';
import GroupList from '../component/GroupList.tsx';

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]/todo/board');

  const { storedGroupList } = storeToRefs(useGroupStore());
  const checkedGroupList = ref(storedGroupList.value);

  const { handleAdd, handleRemove } = (function () {
    const movingTodo = ref<(todo: DynamicTodoModel) => void>();

    function handleAdd(callback: (todo: DynamicTodoModel) => void) {
      // remove より先に呼ばれるため、 todo がイベント発火時点で特定できない
      // callback を保持し、 remove 実行時に呼び出してもらう
      movingTodo.value = callback;
    }

    function handleRemove(todo: DynamicTodoModel) {
      movingTodo.value?.(todo);
      movingTodo.value = undefined;
    }

    return { handleAdd, handleRemove };
  })();

  return () => (
    <div class="flex flex-row">
      <GroupList
        modelValue={checkedGroupList.value}
        onUpdate:modelValue={(v) => (checkedGroupList.value = v)}
        space_id={$route.params.space_id}
        class="h-[calc(100vh-64px)] w-56 shrink-0 overflow-y-auto px-2"
        type="checkbox"
      ></GroupList>

      {/* 
      w-[calc(100vw-224px-224px-10px)]
      224px: グローバルメニュー
      224px: GroupList
       10px: 縦スクロールバーを常時表示しているため
      */}
      <div class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] grow-0 overflow-x-auto px-4 pb-4">
        <div class="flex h-full w-full flex-row gap-2">
          {checkedGroupList.value.map((group) => (
            <div key={group.group_id} class={['shrink-0 break-inside-avoid', 'w-2xl']}>
              <Group
                group={group}
                space_id={$route.params.space_id}
                class="max-h-full overflow-y-auto"
                onAdd={handleAdd}
                onRemove={handleRemove}
              ></Group>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
