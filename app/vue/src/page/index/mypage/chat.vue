<script setup lang="ts">
import { MypageRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { AichatModelList } from '@todo/prisma/schema';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { trpc } from '~/lib/trpc';
import { useMypageStore } from '~/store/MypageStore';

const { mypage } = storeToRefs(useMypageStore());

const modelValue = ref<z.infer<typeof MypageRouterSchema.patchAichatInput>>({
  aichat_enable: mypage.value.aichat_enable,
  aichat_model: mypage.value.aichat_model,
  aichat_api_key: '',
});

const { validateSubmit, ErrorMessage, isDirty, reset } = useVueValidateZod(
  MypageRouterSchema.patchAichatInput,
  modelValue,
);
</script>

<template>
  <form
    class="flex flex-col gap-6"
    autocomplete="off"
    @submit.prevent="
      validateSubmit(async () => {
        const loading = $loading.open();
        try {
          mypage = await trpc.mypage.patchAichat.mutate(modelValue);

          reset({
            aichat_enable: mypage.aichat_enable,
            aichat_model: mypage.aichat_model,
            aichat_api_key: '',
          });

          $toast.success('データを保存しました。');
        } finally {
          loading.close();
        }
      })()
    "
  >
    <section class="flex flex-col gap-4 md:flex-row md:gap-8">
      <div class="flex grow flex-col gap-4">
        <!-- 名前 -->
        <div>
          <label
            for="aichat_enable"
            class="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
          >
            enable
          </label>
          <input
            id="aichat_enable"
            v-model.lazy="modelValue.aichat_enable"
            type="checkbox"
            class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
          />
          <ErrorMessage class="text-xs text-red-600" field="aichat_enable" />
        </div>
        <!-- api key -->
        <div>
          <label
            for="aichat_api_key"
            class="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
          >
            <!-- 保存されているキーを入力する必要があるので、「編集」ボタンを置いて、有効な場合は入力必須、無効な場合は undefined にして更新を避ける  -->
            api key
          </label>
          <input
            id="aichat_api_key"
            v-model.lazy="modelValue.aichat_api_key"
            :disabled="!modelValue.aichat_enable"
            type="text"
            class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          />

          <ErrorMessage class="text-xs text-red-600" field="aichat_api_key" />
        </div>
        <!-- model -->
        <div>
          <label
            for="aichat_model"
            class="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
          >
            model
          </label>
          <select
            id="aichat_model"
            v-model.lazy="modelValue.aichat_model"
            :disabled="!modelValue.aichat_enable"
            class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          >
            <option v-for="model in AichatModelList" :key="model">
              {{ model }}
            </option>
          </select>
          <ErrorMessage class="text-xs text-red-600" field="aichat_model" />
        </div>
      </div>
    </section>

    <section class="flex gap-2">
      <button
        type="submit"
        :class="[
          'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
          'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
          'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
          'border-green-700 bg-green-600 text-white hover:bg-green-800',
          'capitalize',
        ]"
        :disabled="!isDirty"
      >
        save
      </button>
    </section>
  </form>
</template>
