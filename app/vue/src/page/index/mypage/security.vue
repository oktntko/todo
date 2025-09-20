<script setup lang="ts">
import { MypageRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';

const user = ref(await trpc.mypage.get.query());

const modelValue = ref<z.infer<typeof MypageRouterSchema.enableSecretInput>>({
  token: '',
});

const { validateSubmit, ErrorMessage, isDirty, revert } = useVueValidateZod(
  MypageRouterSchema.enableSecretInput,
  modelValue,
);

const qrcode = ref<RouterOutput['mypage']['generateSecret']>({
  dataurl: '',
});
const refInputToken = ref<HTMLInputElement>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- お知らせ -->
    <section>
      <div
        class="flex flex-col gap-4 border-t-2 p-4"
        :class="{
          'border-blue-300 bg-blue-50': user.twofa_enable,
          'border-yellow-300 bg-yellow-50': !user.twofa_enable,
        }"
        role="alert"
      >
        <div class="flex items-center gap-4">
          <span class="sr-only">Info</span>
          <span
            v-if="user.twofa_enable"
            class="icon-[wpf--security-checked] h-32 w-32 text-green-400"
          >
          </span>
          <span v-else class="icon-[fluent-emoji-flat--light-bulb] h-32 w-32"> </span>

          <div>
            <h3
              class="text-lg font-medium"
              :class="{
                'text-blue-900': user.twofa_enable,
                'text-yellow-900': !user.twofa_enable,
              }"
            >
              {{
                user.twofa_enable ? '二要素認証が有効です。' : '二要素認証が有効になっていません。'
              }}
            </h3>
            <button
              v-if="user.twofa_enable"
              type="button"
              class="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
              @click="
                async () => {
                  if (await $dialog.confirm('二要素認証を無効化しますか？')) {
                    const loading = $loading.open();
                    try {
                      await trpc.mypage.disableSecret.mutate();
                      user.twofa_enable = false;

                      $toast.success('二要素認証を無効化しました。');
                    } finally {
                      loading.close();
                    }
                  }
                }
              "
            >
              <span class="icon-[fluent-emoji-flat--light-bulb] mr-2 -ml-1 h-4 w-4"></span>
              無効化する
            </button>
            <button
              v-else
              type="button"
              class="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
              @click="
                async () => {
                  qrcode = await trpc.mypage.generateSecret.mutate();
                  $nextTick(() => refInputToken?.focus());
                }
              "
            >
              <span class="icon-[wpf--security-checked] mr-2 -ml-1 h-4 w-4 text-green-400"></span>
              有効化の設定を開始する
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 有効化フォーム -->

    <section class="flex flex-col gap-4">
      <Transition
        enter-from-class="transform opacity-0 translate-y-4 translate-y-0"
        enter-active-class="transition ease-out duration-200"
        enter-to-class="transform opacity-100 translate-y-0 "
      >
        <div v-if="qrcode.dataurl" class="flex flex-col gap-4">
          <div class="flex items-center space-x-2.5">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600"
            >
              1
            </span>
            <div>
              <h3 class="leading-tight font-medium">
                AuthenticatorアプリでQRコードをスキャンしてください。
              </h3>
              <p class="text-sm text-gray-400">
                Authenticatorアプリは
                <a
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  Google Authenticator
                </a>
                や
                <a
                  href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  Microsoft Authenticator
                </a>
                が人気です。
              </p>
            </div>
          </div>

          <img :src="qrcode.dataurl" width="128" height="128" decoding="async" />
        </div>
      </Transition>

      <Transition
        enter-from-class="transform opacity-0 translate-y-4 translate-y-0"
        enter-active-class="transition ease-out duration-200 delay-200"
        enter-to-class="transform opacity-100 translate-y-0 "
      >
        <form
          v-if="qrcode.dataurl"
          class="flex flex-col gap-4"
          autocomplete="off"
          @submit.prevent="
            validateSubmit(async () => {
              const loading = $loading.open();
              try {
                await trpc.mypage.enableSecret.mutate({
                  ...modelValue,
                });

                revert();
                qrcode.dataurl = '';
                user.twofa_enable = true;

                $toast.success('二要素認証を有効化しました。');
              } finally {
                loading.close();
              }
            })()
          "
        >
          <label for="token" class="flex items-center space-x-2.5">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600"
            >
              2
            </span>
            <span>
              <span class="leading-tight font-medium">コードを検証します。</span>
              <span class="block text-sm text-gray-400">
                Authenticatorアプリに表示される6桁の数字を入力してください。
              </span>
            </span>
          </label>

          <div>
            <div class="flex items-center gap-2">
              <input
                id="token"
                ref="refInputToken"
                v-model.lazy="modelValue.token"
                type="text"
                pattern="\d{6}"
                class="block w-24 rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
                required
                maxlength="6"
              />
              <span class="text-xs text-gray-400"> {{ modelValue.token.length }}/6 桁 </span>
            </div>
            <ErrorMessage class="text-xs text-red-600" field="token"></ErrorMessage>
          </div>

          <section class="flex gap-4">
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
              コードを検証し二要素認証を有効化する
            </button>
          </section>
        </form>
      </Transition>
    </section>
  </div>
</template>
