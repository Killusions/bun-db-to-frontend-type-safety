import { watch } from 'vue';
import { createWebHashHistory, createRouter, type RouteLocationNormalizedGeneric } from 'vue-router';

import { sessionPending, useSession } from './client/auth';

import HomeView from './views/HomeView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import ProfileView from './views/ProfileView.vue';
import ForgotPasswordView from './views/ForgotPasswordView.vue';
import ResetPasswordView from './views/ResetPasswordView.vue';
import AuthCallbackView from './views/AuthCallbackView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView, meta: { noAuth: true } },
  { path: '/register', component: RegisterView, meta: { noAuth: true } },
  { path: '/forgot-password', component: ForgotPasswordView, meta: { noAuth: true } },
  { path: '/reset-password', component: ResetPasswordView, meta: { noAuth: true } },
  { path: '/auth/callback', component: AuthCallbackView, meta: { noAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

const redirectLater = async (to: RouteLocationNormalizedGeneric) => {
  await new Promise(resolve => {
    if (!sessionPending().value) {
      resolve(true);
      return;
    }
    watch(sessionPending(), (pending) => {
      if (!pending) {
        resolve(true);
      }
    }, { once: true });
  });
  const session = useSession();
  const isLoggedIn = !!session.value?.data?.user;
  if (to.meta.requiresAuth && !isLoggedIn) {
    router.push({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.meta.noAuth && isLoggedIn) {
    router.push('/');
  }
};

router.beforeEach((to) => {
  const session = useSession();
  const isLoggedIn = !!session.value?.data?.user;

  if (sessionPending().value) {
    redirectLater(to); // Do not await on purpose.
  } else {
    if (to.meta.requiresAuth && !isLoggedIn) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    } else if (to.meta.noAuth && isLoggedIn) {
      return { path: '/' };
    }
  }
});
