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
      {
        path: 'signup',
        name: 'SignUp',
        component: () => import('@/views/auth/SignUpView.vue'),
        meta: { title: 'Sign Up' },
      },
    ],
  },

  // App shell
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
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
          requiredRoles: ['Administrator', 'Manager', 'Warehouse Staff', 'User', 'Auditor'],
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
          requiredRoles: ['Administrator', 'Manager', 'Warehouse Staff'],
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
          requiredRoles: ['Administrator'],
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
          requiredRoles: ['Administrator'],
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
