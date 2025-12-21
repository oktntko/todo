<script setup lang="ts">
import { DayPilot } from '@daypilot/daypilot-lite-javascript';
import { dayjs } from '@todo/lib/dayjs';
import DOMPurify from 'dompurify';
import { trpc } from '~/lib/trpc';
import SpaceList from '~/page/index/todo/component/SpaceList.vue';
import { useModal } from '~/plugin/ModalPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';
import ModalAddTodo, { type ModalAddTodoResult } from './modal/ModalAddTodo.vue';
import ModalEditTodo, { type ModalEditTodoResult } from './modal/ModalEditTodo.vue';

const $modal = useModal();
const $toast = useToast();

const { storedSpaceList } = storeToRefs(useSpaceStore());
const checkedSpaceList = ref(storedSpaceList.value);

const resources = computed(() => {
  return checkedSpaceList.value.map((space) => {
    return {
      name: space.space_name,
      id: space.space_id,
    } satisfies DayPilot.ResourceData;
  });
});

const todo_list = ref(await trpc.todo.list.query({}));
const events = computed(() => {
  return todo_list.value
    .filter((todo) => checkedSpaceList.value.find((space) => space.space_id === todo.space_id))
    .map((todo) => {
      // All-Day Events は Pro版のみのため、 Business Hours で埋める
      // 開始 ＞ 終了の場合、カレンダーに表示されない
      const startDate = todo.begin_date ? todo.begin_date : dayjs().format('YYYY-MM-DD');
      const startTime = todo.begin_time ? `${todo.begin_time}:00` : dayjs().format('HH:mm:ss');
      const endDate = todo.limit_date ? todo.limit_date : dayjs().format('YYYY-MM-DD');
      const endTime = todo.limit_time ? `${todo.limit_time}:00` : dayjs().format('HH:mm:ss');
      return {
        resource: todo.space.space_id,
        id: todo.todo_id,
        text: todo.title,
        start: /*  */ `${startDate} ${startTime}`,
        end: /*    */ `${endDate} ${endTime}`,

        // TODO borderColor: todo 自体に色を付ける？
        barColor: todo.space.space_color,

        html: `
      <div>
        <div class="line-clamp-1 font-bold">${DOMPurify.sanitize(todo.title)}</div>
        <div class="line-clamp-4 text-xs">${DOMPurify.sanitize(todo.description)}</div>
      </div>`,
        toolTip: todo.description || '',
      } satisfies DayPilot.EventData;
    });
});

watch(checkedSpaceList, () => {
  if (calendar) {
    calendar.update({ columns: resources.value, events: events.value });
  }
  if (month) {
    month.update({ events: events.value });
  }
  if (scheduler) {
    scheduler.update({ resources: resources.value, events: events.value });
  }
});

const viewType = ref<'Day' | 'Resources' | 'Week' | 'WorkWeek' | 'Month' | 'Scheduler'>('WorkWeek');
const component = computed(() => {
  switch (viewType.value) {
    case 'Day':
    case 'Resources':
    case 'Week':
    case 'WorkWeek':
      return 'calendar';
    case 'Month':
      return 'month';
    case 'Scheduler':
      return 'scheduler';
  }
});
watch(viewType, (newValue) => {
  if (navigator) {
    navigator.selectMode = (function () {
      switch (viewType.value) {
        case 'Day':
        case 'Resources':
          return 'Day';
        case 'Week':
        case 'WorkWeek':
          return 'Week';
        case 'Month':
        case 'Scheduler':
          return 'Month';
      }
    })();
    navigator.update();
  }

  if (calendar && newValue !== 'Month' && newValue !== 'Scheduler') {
    calendar.viewType = newValue;
    calendar.update();
  }

  // month, scheduler は viewType の変更はできない
});

const selectedDate = ref<DayPilot.NavigatorTimeRangeSelectedArgs>({
  day: DayPilot.Date.today(),
  start: DayPilot.Date.today(),
  end: DayPilot.Date.today().addDays(7),
  days: 7,
  mode: 'Week',
});

watch(selectedDate, (newValue) => {
  if (calendar) {
    calendar.startDate = newValue.day;
    calendar.update();
  }
  if (month) {
    month.startDate = newValue.day.firstDayOfMonth();
    month.update();
  }
  if (scheduler) {
    scheduler.startDate = newValue.day.firstDayOfMonth();
    scheduler.update();
  }
});

let navigator: DayPilot.Navigator | null = null;
let calendar: DayPilot.Calendar | null = null;
let month: DayPilot.Month | null = null;
let scheduler: DayPilot.Scheduler | null = null;

onMounted(() => {
  navigator = new DayPilot.Navigator('navigator', {
    showMonths: 1,
    skipMonths: 1,
    selectMode: 'Week',
    freeHandSelectionEnabled: false,
    selectionDay: DayPilot.Date.today(),
    orientation: 'Vertical',
    showToday: true,
    todayPosition: 'Top',

    onTimeRangeSelected: (args) => {
      selectedDate.value = args;
    },
    onTodayClick: () => {
      if (navigator == null) {
        return;
      }

      const day = DayPilot.Date.today();

      if (navigator.selectMode === 'Day') {
        selectedDate.value = {
          day,
          start: day,
          end: day.addDays(1),
          days: 1,
          mode: 'Day',
        };
      } else if (navigator.selectMode === 'Week') {
        selectedDate.value = {
          day,
          start: day.firstDayOfWeek(),
          end: day.firstDayOfWeek().addDays(7),
          days: 7,
          mode: 'Week',
        };
      } else if (navigator.selectMode === 'Month') {
        selectedDate.value = {
          day,
          start: day.firstDayOfMonth(),
          end: day.firstDayOfMonth().addDays(day.daysInMonth()),
          days: day.daysInMonth(),
          mode: 'Month',
        };
      }
    },
  });
  navigator.init();

  calendar = new DayPilot.Calendar('calendar', {
    viewType: viewType.value as 'WorkWeek',
    startDate: DayPilot.Date.today(),
    columns: resources.value,
    heightSpec: 'Full',
    headerDateFormat: 'MM-dd(ddd)',
    events: events.value,
    initScrollPos: 1,

    onTimeRangeSelected,
    onEventClicked,
    onEventMoved: onEventChanged,
    onEventResized: onEventChanged,
  });
  calendar.init();

  month = new DayPilot.Month('month', {
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    events: events.value,

    onTimeRangeSelected,
    onEventClicked,
    onEventMoved: onEventChanged,
    onEventResized: onEventChanged,
  });
  month.init();

  scheduler = new DayPilot.Scheduler('scheduler', {
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    heightSpec: 'Max',
    days: 365,
    scale: 'Day',
    timeHeaders: [
      { groupBy: 'Month', format: 'yyyy-MM' },
      { groupBy: 'Day', format: 'dd' },
    ],
    events: events.value,
    resources: resources.value,

    onTimeRangeSelected,
    onEventClicked,
    onEventMoved: onEventChanged,
    onEventResized: onEventChanged,
  });
  scheduler.init();
});

const source = [
  {
    label: 'Day',
    value: 'Day',
  },
  {
    label: 'Resources',
    value: 'Resources',
  },
  {
    label: 'Week',
    value: 'Week',
  },
  {
    label: 'Work',
    value: 'WorkWeek',
  },
  {
    label: 'Month',
    value: 'Month',
  },
  {
    label: 'Scheduler',
    value: 'Scheduler',
  },
] as const;

type TimeRangeArgs = {
  start: DayPilot.Date;
  end: DayPilot.Date;
  resource?: DayPilot.ResourceId;
};
type EventArgs = {
  e: DayPilot.Event;
};
type EventChangedArgs = {
  e: DayPilot.Event;
  newStart: DayPilot.Date;
  newEnd: DayPilot.Date;
  newResource?: DayPilot.ResourceId;
};

async function onTimeRangeSelected(args: TimeRangeArgs) {
  const start = dayjs(args.start.toString());
  const end = dayjs(args.end.toString());

  const result: ModalAddTodoResult = await $modal.showModal(ModalAddTodo, (resolve) => ({
    space_id: args.resource ? Number(args.resource) : undefined,
    begin_date: start.format('YYYY-MM-DD') as `${number}-${number}-${number}`,
    begin_time: start.format('HH:mm') as `${number}:${number}`,
    limit_date: end.format('YYYY-MM-DD') as `${number}-${number}-${number}`,
    limit_time: end.format('HH:mm') as `${number}:${number}`,
    onDone: resolve,
  }));

  todo_list.value.push(result.todo);

  calendar?.update({ events: events.value });
  month?.update({ events: events.value });
  scheduler?.update({ events: events.value });
}

async function onEventClicked(args: EventArgs) {
  const result: ModalEditTodoResult = await $modal.showModal(ModalEditTodo, (resolve) => ({
    todo_id: args.e.id() as string,
    onDone: resolve,
  }));

  const index = todo_list.value.findIndex((x) => x.todo_id === result.todo.todo_id);
  if (result.event === 'delete') {
    todo_list.value.splice(index, 1);
  } else {
    todo_list.value.splice(index, 1, result.todo);
  }

  calendar?.update({ events: events.value });
  month?.update({ events: events.value });
  scheduler?.update({ events: events.value });
}

async function onEventChanged(args: EventChangedArgs) {
  const current = todo_list.value.find((v) => v.todo_id === args.e.id().toString());

  if (current == null) {
    return;
  }

  const loading = $modal.loading();
  try {
    const newStart = dayjs(args.newStart.toString());
    const newEnd = dayjs(args.newEnd.toString());

    const todo = await trpc.todo.update.mutate({
      space_id: args.newResource ? Number(args.newResource) : undefined,
      todo_id: current.todo_id,
      updated_at: current.updated_at,
      begin_date: newStart.format('YYYY-MM-DD'),
      begin_time: newStart.format('HH:mm'),
      limit_date: newEnd.format('YYYY-MM-DD'),
      limit_time: newEnd.format('HH:mm'),
    });

    todo_list.value = todo_list.value.filter((v) => v.todo_id !== todo.todo_id);
    todo_list.value.push(todo);

    calendar?.update({ events: events.value });
    month?.update({ events: events.value });
    scheduler?.update({ events: events.value });

    $toast.success('Todo has been updated.');
  } finally {
    loading.close();
  }
}
</script>

<template>
  <div>
    <div class="flex">
      <!-- left -->
      <div class="flex h-[calc(100vh-64px)] w-56 shrink-0 flex-col gap-2 px-2">
        <header>
          <MyDropdown inner-class="w-full">
            <template #button="{ toggle }">
              <button
                id="space_id"
                type="button"
                class="flex w-full flex-row items-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
                @click="toggle"
              >
                <span class="capitalize">{{ viewType }}</span>
              </button>
            </template>
            <template #default>
              <ul class="w-full rounded-sm border border-gray-300 bg-white shadow-md">
                <li
                  v-for="{ label, value } of source"
                  :key="value"
                  class="flex cursor-pointer items-center px-1.5 py-1 text-sm hover:bg-gray-100"
                  :class="[viewType === value ? 'bg-blue-200' : '']"
                  @click="
                    () => {
                      viewType = value;
                    }
                  "
                >
                  <span>{{ label }}</span>
                </li>
              </ul>
            </template>
          </MyDropdown>
        </header>

        <!-- nav -->
        <div class="flex justify-center">
          <nav id="navigator"></nav>
        </div>
        <!-- filter -->
        <div class="overflow-y-auto">
          <SpaceList v-model="checkedSpaceList" type="checkbox"> </SpaceList>
        </div>
      </div>

      <!-- main -->
      <div class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] grow-0 overflow-x-auto">
        <div v-show="component === 'calendar'">
          <div id="calendar"></div>
        </div>
        <div v-show="component === 'month'">
          <div id="month"></div>
        </div>
        <div v-show="component === 'scheduler'">
          <div id="scheduler"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.navigator_default_main {
  --dp-nav-font-family: var(--font-sans);
}
.calendar_default_main {
  --dp-calendar-font-family: var(--font-sans);
  --dp-calendar-event-bar-bg-color: transparent;
}
.month_default_main {
  --dp-month-font-family: var(--font-sans);
  --dp-month-event-vertical-align: start;
  --dp-month-event-bar-bg-color: transparent; /* 現状この変数はなかったが追加されそうなので宣言しておく */
}
.scheduler_default_main {
  --dp-scheduler-font-family: var(--font-sans);
  --dp-scheduler-event-vertical-align: start;
  --dp-scheduler-event-bar-bg-color: transparent;
}

#calendar {
  /* カレンダーの周囲にボーダーが引かれていて、スクロール時に若干ずれるので無効化する。 sticky をやめれば目立たないが。 */
  border: none;
}

/* header */
#calendar :deep(> div:nth-child(1)) {
  position: sticky;
  top: 0;
  z-index: 1;
  border: 1px solid var(--dp-calendar-border-color);
  border-bottom: none;
}

/* table */
#calendar :deep(> div:nth-child(2)) {
  border: 1px solid var(--dp-calendar-border-color);
  border-top: none;
}
</style>
