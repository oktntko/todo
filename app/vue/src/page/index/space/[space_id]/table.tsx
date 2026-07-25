import { defineComponent, KeepAlive, type DefineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent(() => {
  return () => (
    <div class="h-full">
      <RouterView
        v-slots={{
          default: ({ Component }: { Component?: DefineComponent }) =>
            Component && (
              <KeepAlive include={['space-table-index']}>
                <Component />
              </KeepAlive>
            ),
        }}
      />
    </div>
  );
});
