import type { NotificationRouterSchema } from '@todo/express/schema';

import { dayjs } from '@todo/lib/dayjs';
import { DateTimeSchema, z } from '@todo/lib/zod';
import { useTimestamp } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { computed, defineComponent, ref } from 'vue';

import MyButton from '~/component/button/MyButton.tsx';
import MyCheckbox from '~/component/input/MyCheckbox.vue';
import MyInput from '~/component/input/MyInput.vue';
import { trpc } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useNotificationStore } from '~/store/NotificationStore.ts';

type Props = {
  todo_id: string;
};
const props = satisfiesKeys<Props>()('todo_id');

const emits = {
  done: (_: z.infer<typeof NotificationRouterSchema.getOutput>) => true,
} satisfies EmitsType;

export default defineComponent(
  ({ todo_id }: Props, { emit: $emit }) => {
    const $toast = useToast();
    const $dialog = useDialog();

    const { storedNotificationList } = storeToRefs(useNotificationStore());

    const modelValue = ref<z.input<typeof ModalAddNotificationSchema>>({
      point: '20 minutes later',
      notification_at: '',
    });

    const { validate, ErrorMessage } = useVueValidateZod(ModalAddNotificationSchema, modelValue);

    const timestamp = useTimestamp({ offset: 0 });
    const time = computed(() => {
      const currentDatetime = dayjs(timestamp.value);

      const a20MinutesLater = currentDatetime.add(30, 'second'); /* TODO: Debug */
      // const a20MinutesLater = currentDatetime.add(20, 'minute');
      const a30MinutesLater = currentDatetime.add(30, 'minute');
      const a1HourLater = currentDatetime.add(1, 'hour');

      const todayEvening = currentDatetime.set('hour', 17).startOf('hour');
      const todayNight = currentDatetime.set('hour', 21).startOf('hour');
      const todayMidnight = currentDatetime.add(1, 'day').startOf('day');

      const tomorrowMorning = currentDatetime.add(1, 'day').set('hour', 8).startOf('hour');

      return {
        '20 minutes later': a20MinutesLater,
        '30 minutes later': a30MinutesLater,
        '1 hour later': a1HourLater,
        today: currentDatetime.isBefore(currentDatetime)
          ? todayEvening
          : currentDatetime.isBefore(todayNight)
            ? todayNight
            : todayMidnight,
        tomorrow: tomorrowMorning,
        custom: '',
      } as const;
    });

    return () => (
      <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <header class="mb-4 text-lg font-bold capitalize">add notification</header>
        <form
          class="flex flex-col gap-6"
          autocomplete="off"
          onSubmit={async (e) => {
            e.preventDefault();

            const result = await validate();
            if (!result.success) return;

            const value = result.data;

            const loading = $dialog.loading();
            try {
              const delay = -dayjs().diff(
                time.value[value.point] ? time.value[value.point] : dayjs(value.notification_at),
                'millisecond',
              );
              const notification = await trpc.notification.addTodo.mutate({
                todo_id,
                delay,
              });

              storedNotificationList.value.push(notification);

              $toast.success('Data has been saved.');

              $emit('done', notification);
            } finally {
              loading.close();
            }
          }}
        >
          <section class="flex flex-col gap-3">
            <div class="flex gap-6">
              <div class="focus-container flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  {(['20 minutes later', '30 minutes later', '1 hour later'] as const).map(
                    (point) => (
                      <MyCheckbox
                        id={point}
                        key={point}
                        v-model={modelValue.value.point}
                        type="radio"
                        value={point}
                      >
                        <div
                          class={[
                            'flex grow items-center justify-between gap-4 transition-colors',
                            modelValue.value.point === point ? 'text-blue-600' : '',
                          ]}
                        >
                          <span class="capitalize">{point}</span>
                          <span class="font-mono">{time.value[point].format('HH:mm')}</span>
                        </div>
                      </MyCheckbox>
                    ),
                  )}
                </div>

                <div class="flex flex-col gap-2">
                  {(['today'] as const).map((point) => (
                    <MyCheckbox
                      id={point}
                      key={point}
                      v-model={modelValue.value.point}
                      type="radio"
                      value={point}
                    >
                      <div
                        class={[
                          'flex grow items-center justify-between gap-4 transition-colors',
                          modelValue.value.point === point ? 'text-blue-600' : '',
                        ]}
                      >
                        <span class="capitalize">{point}</span>
                        <span class="inline-flex items-center gap-1.5 font-mono">
                          <span class="icon-[icon-park--moon] h-5 w-5"></span>
                          {time.value[point].format('MM-DD(dd) HH:mm')}
                        </span>
                      </div>
                    </MyCheckbox>
                  ))}
                  {(['tomorrow'] as const).map((point) => (
                    <MyCheckbox
                      id={point}
                      key={point}
                      v-model={modelValue.value.point}
                      type="radio"
                      value={point}
                    >
                      <div
                        class={[
                          'flex grow items-center justify-between gap-4 transition-colors',
                          modelValue.value.point === point ? 'text-blue-600' : '',
                        ]}
                      >
                        <span class="capitalize">{point}</span>
                        <span class="inline-flex items-center gap-1 font-mono">
                          <span class="icon-[icon-park--sun-one] h-6 w-6"></span>
                          {time.value[point].format('MM-DD(dd) HH:mm')}
                        </span>
                      </div>
                    </MyCheckbox>
                  ))}
                </div>

                <div class="flex flex-col gap-2">
                  <MyCheckbox
                    id="custom"
                    v-model={modelValue.value.point}
                    type="radio"
                    value="custom"
                  >
                    <div
                      class={[
                        'flex grow items-center justify-between gap-4 transition-colors',
                        modelValue.value.point === 'custom' ? 'text-blue-600' : '',
                      ]}
                    >
                      <span class="capitalize">custom</span>
                      <MyInput
                        disabled={modelValue.value.point !== 'custom'}
                        type="datetime-local"
                        class="p-1.5! font-mono"
                        v-model={modelValue.value.notification_at}
                      />
                    </div>
                  </MyCheckbox>
                </div>

                <ErrorMessage class="text-xs text-red-600" field="point" />
              </div>
            </div>
          </section>

          <section class="flex gap-2">
            <MyButton type="submit" color="green" variant="contained">
              <span class="capitalize">save</span>
            </MyButton>
          </section>
        </form>
      </div>
    );
  },
  {
    props,
    emits,
  },
);

export const PointList = [
  '20 minutes later',
  '30 minutes later',
  '1 hour later',
  'today',
  'tomorrow',
  'custom',
] as const;
export const PointSchema = z.enum(PointList);

const ModalAddNotificationSchema = z.object({
  point: PointSchema,
  notification_at: DateTimeSchema.or(z.literal('')),
});
