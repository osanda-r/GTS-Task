// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'
import middlewarePipeline from '@/helpers/utils/middlewarePipeline.ts'
import type { MiddlewareFunction, Context } from '@/helpers/types/functionTypes'
import { auth, authReady, db } from '@/plugins/firebase'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  try {
    await authReady
    if (to.name === 'NotFound') {
      return next()
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    if (requiresAuth && !auth.currentUser) {
      return next({ name: 'Login' })
    }

    const requiredPermission = to.matched.find((record) => record.meta.requiredPermission)?.meta
      .requiredPermission as string | undefined

    if (requiredPermission && auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (!userDoc.exists()) {
          console.error('User document not found in Firestore:', auth.currentUser.uid)
          return next({ name: 'Login' })
        }

        const userRole = String(userDoc.data().role ?? '').trim()
        console.log('User role:', userRole)

        if (!userRole) {
          console.error('User has no role assigned')
          return next({ name: 'Dashboard' })
        }

        // Administrator has access to all pages
        if (userRole.toLowerCase() === 'administrator') {
          return next()
        }

        const roleSnapshot = await getDocs(
          query(collection(db, 'roles'), where('name', '==', userRole)),
        )

        if (roleSnapshot.empty) {
          console.error('Role not found in roles collection:', userRole)
          return next({ name: 'Dashboard' })
        }

        const roleDoc = roleSnapshot.docs[0]
        const permissions = Array.isArray(roleDoc?.data().permissions)
          ? roleDoc.data().permissions.map((permission: unknown) => String(permission))
          : []

        console.log('User permissions:', permissions)
        console.log('Required permission:', requiredPermission)

        if (!permissions.includes(requiredPermission)) {
          console.warn('Access denied - missing permission:', requiredPermission)
          return next({ name: 'Dashboard' })
        }
      } catch (error) {
        console.error('Error checking user permissions:', error)
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
    return next({ name: 'Dashboard' })
  }
})

export default router
