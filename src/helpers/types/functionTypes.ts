// helpers/types/functionTypes.ts
import type { RouteLocationNormalized, NavigationGuardNext, Router } from 'vue-router'

export type Context = {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next: NavigationGuardNext
  router: Router
}

export type MiddlewareFunction = (context: Context) => void
