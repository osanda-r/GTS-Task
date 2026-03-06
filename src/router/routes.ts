import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // AUTH LAYOUT (Blank)
  {
    path: '/auth',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Sign In' }
      },
    ],
  },

  // Redirects
  // {
  //   path: '',
  //   redirect: '/dashboard'
  // },

  {
    path: '',
    redirect: '/x'
  },

  // Dashboard
  {
    path: '/x',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dash',
        name: 'Dashboard',
        component: () => import('@/views/sample/SampleView.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          showInSidebar: true
        }
      },
      {
        path: 'dash2',
        name: 'Dashboardx',
        component: () => import('@/views/sample/SampleView.vue'),
        meta: {
          title: 'Dashboardx',
          icon: 'mdi-view-dashboard',
          showInSidebar: true
        }
      },
      {
        path: 'list',
        name: 'List',
        component: () => import('@/views/sample/SampleView.vue'),
        meta: {
          title: 'List',
          icon: 'mdi-format-list-bulleted',
          showInSidebar: true
        },
        children: [
          {
            path: 'view-1',
            name: 'ListView1',
            component: () => import('@/views/sample/SampleView.vue'),
            meta: {
              title: 'List View 1',
              icon: 'mdi-eye',
              showInSidebar: true
            }
          },
          {
            path: 'view-2',
            name: 'ListView2',
            component: () => import('@/views/sample/SampleView.vue'),
            meta: {
              title: 'List View 2',
              icon: 'mdi-eye-outline',
              showInSidebar: true
            }
          }
        ]
      }
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: { title: 'Page Not Found', type: 'hidden' }
  }
]

export { routes }
