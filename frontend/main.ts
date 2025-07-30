import { createApp } from 'vue';

import { router } from './router';

import App from './App.vue';

const app = createApp(App);

app.use(router);

if (import.meta.hot) {
  import.meta.hot.on('bun:invalidate', () => {
    app.unmount();
  })
  import.meta.hot.accept();
}

app.mount('#app');
