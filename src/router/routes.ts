import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Auth layout
  {
    path: '/auth',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Sign In' },
      },
    ],
  },

  // App shell
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          showInSidebar: true,
        },
      },
      {
        path: 'goods-received',
        name: 'GoodsReceived',
        component: () => import('@/views/product/GoodsReceivedView.vue'),
        meta: {
          title: 'Goods Received',
          icon: 'mdi-truck-delivery',
          showInSidebar: true,
        },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UsersView.vue'),
        meta: {
          title: 'Users',
          icon: 'mdi-account-multiple',
          showInSidebar: true,
        },
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/roles/RolesView.vue'),
        meta: {
          title: 'Roles',
          icon: 'mdi-shield-account',
          showInSidebar: true,
        },
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: { title: 'Page Not Found', type: 'hidden' },
  },
]

export { routes }
