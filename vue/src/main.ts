import App from '~/App.vue';
import router from '~/lib/router';
import '~/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
