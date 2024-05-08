import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/account/Login.vue'),
    meta: {
      title: 'Login',
      hasLoggedOutGuard: true,
    },
  },
  {
    path: '/:catchAll(.*)*',
    name: 'PageNotFound',
    component: () => import('../pages/PageNotFound.vue'),
    meta: { title: 'Page Not Found' },
  },
]
