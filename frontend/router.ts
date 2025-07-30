import { createWebHashHistory, createRouter } from 'vue-router';

import { loggedIn } from './client/auth';

import HomeView from './views/HomeView.vue';
import LoginView from './views/LoginView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView, meta: { noAuth: true } }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !loggedIn.value) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    };
  } else if (to.meta.noAuth && loggedIn.value) {
    return { path: '/' };
  }
});
