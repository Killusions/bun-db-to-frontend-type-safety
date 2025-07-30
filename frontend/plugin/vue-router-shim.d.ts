import 'vue-router';

export { };

declare module 'vue-router' {
  interface RouteMeta {
    noAuth?: boolean;
    requiresAuth?: boolean;
  }
};
