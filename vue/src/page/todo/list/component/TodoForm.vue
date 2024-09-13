<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import * as R from 'remeda';
import { useValidate } from '~/composable/useValidate';
import { trpc } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

export type ModelValue = z.infer<typeof TodoRouterSchema.upsertInput>;
export type Reset = (modelValue: ModelValue) => void;

const modelValue = defineModel<ModelValue>({ required: true });

defineEmits<{
  change: [];
}>();

const { validateSubmit } = useValidate(TodoRouterSchema.upsertInput, modelValue);

const edit = ref(false);
const status = ref<'' | 'saving...' | 'saved!'>('');
const debounceResetStatus = R.debounce(() => (status.value = ''), { waitMs: 1000 });

const handleSubmit = validateSubmit(async (value) => {
  try {
    status.value = 'saving...';
    await trpc.todo.upsert.mutate(value);

    status.value = 'saved!';
    debounceResetStatus.call();
  } finally {
    //
  }
});

const debounceHandleSubmit = R.debounce(handleSubmit, { waitMs: 500 });
async function handleInput() {
  // watch だと検索条件を変更したときにwatchが発火してしまう
  // {deep:true} を付けても newとoldの値が一致するので値の変化を取得できない
  // ので @inputイベントを監視して submit を発火する
  debounceHandleSubmit.call();
}
</script>

<template>
  <form
    v-on-click-outside="() => (edit = false)"
    class="px-6 py-2 text-sm relative"
    :class="[edit ? 'bg-gray-100' : '']"
    autocomplete="off"
    @click="edit = true"
    @submit.prevent="handleSubmit"
  >
    <div v-show="edit" class="inset-y-0 left-0 absolute flex items-center justify-center">
      <button type="button" class="flex items-center justify-center cursor-move" title="handle">
        <span class="icon-[radix-icons--drag-handle-dots-2] h-5 w-5"></span>
        <span class="sr-only capitalize">handle</span>
      </button>
    </div>

    <div class="flex flex-row gap-2 relative">
      <div class="flex items-start justify-center">
        <button
          v-if="status === '' && modelValue.done_at == null"
          type="button"
          class="flex items-center justify-center hover:bg-gray-200 text-gray-900 hover:text-green-500 transition-colors group rounded-full p-1.5"
          title="done"
          @click.prevent="
            async () => {
              modelValue.done_at = new Date();
              $emit('change');
              return handleSubmit();
            }
          "
        >
          <span
            class="group-hover:icon-[material-symbols--check-circle-outline-rounded] icon-[material-symbols--circle-outline] group-hover:h-5 h-5 group-hover:w-5 w-5"
          ></span>
          <span class="sr-only capitalize">done</span>
        </button>
        <button
          v-if="status === '' && modelValue.done_at != null"
          type="button"
          class="flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 text-green-500 transition-colors group rounded-full p-1.5"
          title="active"
          @click.prevent="
            async () => {
              modelValue.done_at = null;
              $emit('change');
              return handleSubmit();
            }
          "
        >
          <span
            class="icon-[material-symbols--check-circle-outline-rounded] group-hover:icon-[material-symbols--circle-outline] group-hover:h-5 h-5 group-hover:w-5 w-5"
          ></span>
          <span class="sr-only capitalize">done</span>
        </button>
        <div
          v-if="status === 'saving...'"
          class="flex items-center justify-center transition-colors rounded-full p-1.5"
          title="status"
        >
          <span class="icon-[eos-icons--bubble-loading] h-5 w-5 text-gray-500"></span>
          <span class="sr-only capitalize">saving</span>
        </div>
        <div
          v-if="status === 'saved!'"
          class="flex items-center justify-center transition-colors rounded-full p-1.5"
          title="status"
        >
          <span class="icon-[bi--brightness-high-fill] h-5 w-5 text-pink-500"></span>
          <span class="sr-only capitalize">saved</span>
        </div>
      </div>

      <div class="flex flex-col relative gap-1.5 grow min-w-0">
        <div class="flex flex-row gap-1 relative">
          <input
            v-model.trim="modelValue.title"
            type="text"
            class="block bg-inherit w-full outline-none border-b border-b-gray-400 pb-0.5 sm:text-sm"
            placeholder="Title"
            maxlength="100"
            @input="handleInput"
          />

          <MyDropdown v-show="edit">
            <template #button="{ toggle }">
              <button
                type="button"
                class="flex items-center justify-center rounded-full p-0.5 hover:bg-gray-200 transition-colors"
                @click="toggle"
              >
                <span class="icon-[bx--menu] h-4 w-4"></span>
                <span class="sr-only capitalize">menu</span>
              </button>
            </template>
            <template #default>
              <ul class="w-48 bg-white rounded border border-gray-300 shadow-md">
                <li>
                  <button
                    type="button"
                    class="flex items-center w-full p-2 transition duration-75 group hover:bg-gray-200 text-yellow-600"
                    @click="
                      async () => {
                        await trpc.todo.delete.mutate(modelValue);
                        $emit('change');
                      }
                    "
                  >
                    <span class="icon-[tabler--trash-filled] w-4 h-4"></span>
                    <span class="ms-1 capitalize">delete todo</span>
                  </button>
                </li>
              </ul>
            </template>
          </MyDropdown>
        </div>

        <div
          v-show="
            edit ||
            modelValue.limit_date ||
            modelValue.limit_time ||
            modelValue.begin_date ||
            modelValue.begin_time
          "
          class="flex flex-row-reverse justify-end items-center gap-2"
        >
          <div class="flex flex-row gap-2">
            <div v-show="edit || modelValue.limit_date">
              <input
                :id="`${modelValue.todo_id}-limit_date`"
                v-model="modelValue.limit_date"
                type="date"
                class="block bg-inherit outline-none border-b border-b-gray-400 pb-0.5 sm:text-sm"
                @input="handleInput"
              />
            </div>
            <div v-show="edit || modelValue.limit_time">
              <input
                :id="`${modelValue.todo_id}-limit_time`"
                v-model="modelValue.limit_time"
                type="time"
                class="block bg-inherit outline-none border-b border-b-gray-400 pb-0.5 sm:text-sm"
                @input="handleInput"
              />
            </div>
          </div>
          <div>～</div>
          <div class="flex flex-row gap-2">
            <div v-show="edit || modelValue.begin_date">
              <input
                :id="`${modelValue.todo_id}-begin_date`"
                v-model="modelValue.begin_date"
                type="date"
                class="block bg-inherit outline-none border-b border-b-gray-400 pb-0.5 sm:text-sm"
                @input="handleInput"
              />
            </div>
            <div v-show="edit || modelValue.begin_time">
              <input
                :id="`${modelValue.todo_id}-begin_time`"
                v-model="modelValue.begin_time"
                type="time"
                class="block bg-inherit outline-none border-b border-b-gray-400 pb-0.5 sm:text-sm"
                @input="handleInput"
              />
            </div>
          </div>
        </div>

        <div class="text-xs">
          <textarea
            v-show="edit"
            :id="`${modelValue.todo_id}-description`"
            v-model.trim="modelValue.description"
            class="block bg-inherit w-full outline-none border-b border-b-gray-400 pb-0.5"
            rows="4"
            maxlength="400"
            placeholder="Description"
            @input="handleInput"
          ></textarea>
          <label
            v-show="!edit && modelValue.description"
            :for="`${modelValue.todo_id}-description`"
            class="text-gray-500 inline-block max-w-full break-words whitespace-pre-wrap"
          >
            {{ modelValue.description }}
          </label>
        </div>
      </div>
    </div>
  </form>
</template>
