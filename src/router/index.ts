// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'
import middlewarePipeline from '@/helpers/utils/middlewarePipeline.ts'
import type { MiddlewareFunction, Context } from '@/helpers/types/functionTypes'
import { auth, authReady, db } from '@/plugins/firebase'
import { doc, getDoc } from 'firebase/firestore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  try {
    await authReady

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    if (requiresAuth && !auth.currentUser) {
      return next({ name: 'Login' })
    }

    if (to.name === 'Login' && auth.currentUser) {
      return next({ name: 'Dashboard' })
    }

    // Check role-based access control
    const requiredRoles = to.matched.find((record) => record.meta.requiredRoles)?.meta
      .requiredRoles as string[] | undefined

    if (requiredRoles && auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (!userDoc.exists()) {
          return next({ name: 'Login' })
        }

        const userRole = userDoc.data().role
        if (!requiredRoles.includes(userRole)) {
          return next({ name: 'Dashboard' })
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        return next({ name: 'Dashboard' })
      }
    }

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
