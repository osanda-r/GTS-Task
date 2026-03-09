/// <reference types="vite/client" />

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    showInSidebar?: boolean
    requiresAuth?: boolean
    requiredRoles?: string[]
    middleware?: unknown
    type?: string
  }
}
