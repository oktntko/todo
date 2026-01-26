import { WhiteboardRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVModel } from '@vueuse/core';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import MyButton from '~/component/button/MyButton';
import MyInput from '~/component/input/MyInput.vue';
import MyTextarea from '~/component/input/MyTextarea.vue';
import { satisfiesKeys, type EmitsType } from '~/lib/vue';

export type ModelValue = z.infer<typeof WhiteboardRouterSchema.createInput>;
type Props = {
  modelValue: ModelValue;
};
const props = satisfiesKeys<Props>()('modelValue');

const emits = {
  submit: (_: ModelValue) => true,
  'update:modelValue': (_: ModelValue) => true,
} satisfies EmitsType;

export type WhiteboardFormSlots = {
  buttons?: () => JSX.Element;
};

export default defineComponent(
  ($props: Props, { emit: $emit, slots }) => {
    const modelValue = useVModel($props, 'modelValue', $emit);

    const { validate, ErrorMessage, isDirty } = useVueValidateZod(
      WhiteboardRouterSchema.createInput,
      modelValue,
    );

    return () => (
      <form
        class="flex flex-col gap-6"
        autocomplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await validate();
          if (!result.success) return;

          $emit('submit', result.data);
        }}
      >
        <section class="flex flex-col gap-3">
          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="whiteboard_name" class="required text-sm capitalize">
                name
              </label>
            </div>

            <div>
              <MyInput
                id="whiteboard_name"
                v-model={modelValue.value.whiteboard_name}
                type="text"
                class="w-full"
                maxlength="100"
                required
              />
            </div>

            <ErrorMessage class="text-xs text-red-600" field="whiteboard_name" />
          </div>

          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="whiteboard_description" class="optional text-sm capitalize">
                description
              </label>
            </div>

            <div>
              <MyTextarea
                id="whiteboard_description"
                v-model={modelValue.value.whiteboard_description}
                class="w-full"
                rows="4"
                maxlength="400"
              ></MyTextarea>
            </div>

            <ErrorMessage class="text-xs text-red-600" field="whiteboard_description" />
          </div>
        </section>

        <section class="flex gap-2">
          <MyButton type="submit" disabled={!isDirty.value} color="green" variant="contained">
            <span class="capitalize">save</span>
          </MyButton>

          {slots.buttons?.()}
        </section>
      </form>
    );
  },
  {
    props,
    emits,
    slots: {} as SlotsType<WhiteboardFormSlots>,
  },
);
