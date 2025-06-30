<script setup lang="ts">
// import { dayjs } from '@todo/lib/dayjs';
import type { EventSourceInput } from '@fullcalendar/core/index.js';
import daygrid from '@fullcalendar/daygrid';
import interaction from '@fullcalendar/interaction';
import list from '@fullcalendar/list';
import multimonth from '@fullcalendar/multimonth';
import timegrid from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import type { z } from '@todo/lib/zod';
import dayjs from 'dayjs';
import type { TodoRouterSchema } from 'todo-express/schema';
import { trpc, type RouterOutput } from '~/lib/trpc';

const modelValue = ref<z.infer<typeof TodoRouterSchema.searchInput>>({
  where: {
    space_id: null,
    todo_keyword: '',
    todo_status: ['active'],
  },
  sort: {
    field: 'updated_at',
    order: 'desc',
  },
  limit: 50,
  page: 1,
});

const data = ref<RouterOutput['todo']['search']>({
  total: 0,
  todo_list: [],
});

const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await trpc.todo.search.query(modelValue.value);
  } finally {
    loading.value = false;
  }
});

const events: Ref<EventSourceInput> = computed(() => {
  return data.value.todo_list.map((todo) => ({
    id: todo.todo_id,
    title: todo.title,
    start: dayjs(`${todo.begin_date} ${todo.begin_time}`.trim()).toISOString(),
    end: dayjs(`${todo.limit_date} ${todo.limit_time}`.trim()).toISOString(),
  }));
});
</script>

<template>
  <FullCalendar
    :options="{
      plugins: [daygrid, interaction, list, multimonth, timegrid],
      headerToolbar: { center: 'multiMonthYear,dayGridMonth,timeGridWeek' },
      initialView: 'timeGridWeek',

      views: {
        multiMonthYear: {
          titleFormat: function ({ start }) {
            return dayjs(start.marker).format('YYYY');
          },
        },
        dayGridMonth: {
          titleFormat: function ({ start }) {
            return (
              dayjs(start.marker).format('YYYY-MM-DD') +
              ' ~ ' +
              dayjs(start.marker).endOf('month').format('YYYY-MM-DD')
            );
          },
        },
        timeGridWeek: {
          titleFormat: function ({ start }) {
            return (
              dayjs(start.marker).format('YYYY-MM-DD') +
              ' ~ ' +
              dayjs(start.marker).endOf('week').format('YYYY-MM-DD')
            );
          },
        },
      },
      events,
    }"
  >
    <template #eventContent="arg">
      <b>{{ arg.event.title }}</b>
    </template>
  </FullCalendar>
</template>
