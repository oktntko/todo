import type { z } from '@todo/lib/zod';

import { MessageSchema } from '@todo/express/schema';
import { defineComponent, onMounted, ref } from 'vue';

import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';

export default defineComponent(() => {
  const $dialog = useDialog();

  const data = ref<RouterOutput['aichat']['list']>([]);
  const loading = ref(false);

  const modelValue = ref<z.infer<typeof MessageSchema>>({
    role: 'user',
    content: '',
  });

  onMounted(async () => {
    loading.value = true;
    try {
      data.value = await trpc.aichat.list.query({});
    } finally {
      loading.value = false;
    }
  });

  async function handleSubmit() {
    const loading = $dialog.loading();
    try {
      data.value = await trpc.aichat.chat.mutate({
        messages: data.value,
        message: modelValue.value,
      });
    } finally {
      loading.close();
    }
  }

  return () => (
    <div>
      {data.value.map(({ message }, i) => (
        <div key={i}>
          <div>{message.role}</div>
          <div>{message.content}</div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              return handleSubmit();
            }}
          >
            <div>
              <textarea v-model={modelValue.value.content} class="w-full bg-white"></textarea>
            </div>
            <button type="submit">send</button>
          </form>
        </div>
      ))}
    </div>
  );
});
