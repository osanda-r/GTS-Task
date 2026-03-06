// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'
import middlewarePipeline from '@/helpers/utils/middlewarePipeline.ts'
import type { MiddlewareFunction, Context } from '@/helpers/types/functionTypes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  try {
    const middleware = to.meta.middleware as MiddlewareFunction[] | undefined

    if (!middleware || middleware.length === 0) {
      return next()
    }

    const context: Context = { to, from, next, router }

    return middleware[0]({
      ...context,
      next: middlewarePipeline(context, middleware, 1),
    })
  } catch (error) {
    console.error('Middleware pipeline error:', error)
    return next('/')
  }
})

export default router
