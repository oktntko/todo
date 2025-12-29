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
        const loading = $dialog.loading();
        try {
          mypage = await trpc.mypage.patchAichat.mutate(modelValue);

          reset({
            aichat_enable: mypage.aichat_enable,
            aichat_model: mypage.aichat_model,
            aichat_api_key: '',
          });

          $toast.success('Data saved successfully.');
        } finally {
          loading.close();
        }
      })()
    "
  >
    <section class="flex flex-col gap-3">
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <MyCheckbox id="aichat_enable" v-model="modelValue.aichat_enable" type="checkbox">
            <span class="capitalize">enable</span>
          </MyCheckbox>
        </div>

        <ErrorMessage class="text-xs text-red-600" field="aichat_enable" />
      </div>

      <!-- api key -->
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="aichat_api_key" class="text-sm capitalize"> api key </label>
        </div>

        <!-- TODO 保存されているキーを入力する必要があるので、「編集」ボタンを置いて、有効な場合は入力必須、無効な場合は undefined にして更新を避ける  -->

        <div>
          <MyInput
            id="aichat_api_key"
            v-model="modelValue.aichat_api_key"
            :disabled="!modelValue.aichat_enable"
            type="text"
            class="w-full"
          />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="aichat_api_key" />
      </div>

      <!-- model -->
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="aichat_model" class="text-sm capitalize"> model </label>
        </div>

        <div>
          <MySelect
            id="aichat_model"
            v-model="modelValue.aichat_model"
            :disabled="!modelValue.aichat_enable"
            class="flex min-w-60"
          >
            <option
              v-for="model in AichatModelList"
              :key="model"
              :value="model"
              class="border border-gray-300 p-2 transition-colors"
              :class="[
                'not-first-of-type:border-t-0 not-last-of-type:border-b-0 first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
                'hover:bg-gray-100',
                'checked:bg-blue-100 checked:font-bold',
              ]"
            >
              <span class="ms-1">{{ model }}</span>
            </option>
          </MySelect>
        </div>

        <ErrorMessage class="text-xs text-red-600" field="aichat_model" />
      </div>
    </section>

    <section class="flex gap-2">
      <MyButton type="submit" :disabled="!isDirty" color="green" variant="contained">
        <span class="capitalize">save</span>
      </MyButton>
    </section>
  </form>
</template>
