const routes = [
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
          requiredPermission: 'page.goods_received.view',
        },
      },
      {
        path: 'products/add',
        name: 'AddProduct',
        component: () => import('@/views/product/AddProductView.vue'),
        meta: {
          title: 'Add Product',
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
          requiredPermission: 'page.users.view',
        },
      },
      {
        path: 'users/add',
        name: 'AddUser',
        component: () => import('@/views/users/AddUserView.vue'),
        meta: {
          title: 'Add New User',
          requiredPermission: 'page.users.create',
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
          requiredPermission: 'page.roles.view',
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
