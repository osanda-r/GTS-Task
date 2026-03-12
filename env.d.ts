/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    showInSidebar?: boolean
    requiresAuth?: boolean
    requiredRoles?: string[]
    requiredPermission?: string
    middleware?: unknown
    type?: string
  }
}

export {}
