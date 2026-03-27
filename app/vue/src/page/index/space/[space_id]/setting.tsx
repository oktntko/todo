import { defineComponent } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

export default defineComponent(async () => {
  return () => (
    <div class="container mx-auto flex max-w-5xl flex-row">
      <aside class="flex w-56 shrink-0 flex-col gap-2 px-4">
        <div>
          <ul class="text-sm">
            <li>
              <RouterLink
                to={{ name: '//space/[space_id]/setting/' }}
                class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[uil--setting] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="ml-2 capitalize">general</span>
              </RouterLink>
            </li>

            <li>
              <RouterLink
                to={{ name: '//space/[space_id]/setting/chat' }}
                class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[vaadin--chat] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="ml-2 capitalize">chat</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </aside>

      <div class="grow">
        <RouterView />
      </div>
    </div>
  );
});
