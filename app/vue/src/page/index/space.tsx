import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent(async () => {
  return () => (
    <div>
      <RouterView />
    </div>
  );
});
