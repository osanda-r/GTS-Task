<template>
  <v-app>
    <!-- Navigation Drawer (Sidebar) -->
    <v-navigation-drawer v-model="drawer" app :rail="rail" @click="rail = false">
      <!-- User Profile Section -->
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="rail ? '' : 'John Doe'"
        :subtitle="rail ? '' : 'john@example.com'"
        nav
      >
        <template v-slot:append>
          <v-btn
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            variant="text"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Navigation Items -->
      <v-list density="compact" nav>
        <template v-for="route in sidebarRoutes" :key="route.path">
          <!-- Routes with children (nested) -->
          <v-list-group
            v-if="route.children && route.children.length > 0"
            :value="openGroups[getFullPath(route)]"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="iconOf(route)"
                :title="titleOf(route)"
                @click.stop="toggleGroup(getFullPath(route))"
              >
                <v-badge
                  v-if="badgeOf(route)"
                  :content="badgeOf(route)"
                  color="error"
                  inline
                ></v-badge>
              </v-list-item>
            </template>

            <!-- Child routes -->
            <v-list-item
              v-for="child in sidebarChildren(route)"
              :key="child.path"
              :prepend-icon="iconOf(child)"
              :title="titleOf(child)"
              :to="getFullPath(route, child)"
              :active="isActiveRoute(getFullPath(route, child))"
              @click="onChildClick(getFullPath(route))"
            >
              <v-badge
                v-if="badgeOf(child)"
                :content="badgeOf(child)"
                color="error"
                inline
              ></v-badge>
            </v-list-item>
          </v-list-group>

          <!-- Routes without children -->
          <v-list-item
            v-else
            :prepend-icon="iconOf(route)"
            :title="titleOf(route)"
            :value="route.path"
            :to="getFullPath(route)"
            :active="isActiveRoute(getFullPath(route))"
          >
            <v-badge v-if="badgeOf(route)" :content="badgeOf(route)" color="error" inline></v-badge>
          </v-list-item>
        </template>
      </v-list>

      <!-- Logout Button -->
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block prepend-icon="mdi-logout" @click="handleLogout" variant="tonal">
            {{ rail ? '' : 'Logout' }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top Navigation Bar -->
    <TopNavBar @toggle-drawer="drawer = !drawer" />

    <!-- Main Content Area -->
    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { routes as appRoutes } from '@/router/routes'
import TopNavBar from '@/component/TopNavBar.vue'

type RouteMeta = {
  layout?: string
  showInSidebar?: boolean
  title?: string
  icon?: string
  badge?: string | number | null
  [key: string]: unknown
}

type AppRoute = RouteRecordRaw & {
  meta?: RouteMeta
  children?: AppRoute[]
}

const router = useRouter()
const route = useRoute()

const drawer = ref(true)
const rail = ref(false)

const allRoutes = (): AppRoute[] => {
  if (Array.isArray(appRoutes) && appRoutes.length > 0) return appRoutes as AppRoute[]
  const runtime = (router.options && (router.options.routes as RouteRecordRaw[])) || []
  return runtime as AppRoute[]
}

const findLayoutRoot = (routes: AppRoute[]) => {
  const byMeta = routes.find((r) => r.meta && r.meta.layout === 'main')
  if (byMeta) return byMeta

  const byChildrenWithSidebar = routes.find(
    (r) => r.children && r.children.some((c) => c.meta?.showInSidebar),
  )
  if (byChildrenWithSidebar) return byChildrenWithSidebar

  const byChildren = routes.find((r) => r.children && r.children.length > 0)
  if (byChildren) return byChildren

  return undefined
}

const sidebarRoutes = computed<AppRoute[]>(() => {
  const all = allRoutes()
  const parentRoute = findLayoutRoot(all)
  if (parentRoute && parentRoute.children) {
    return parentRoute.children.filter((child) => child.meta?.showInSidebar) as AppRoute[]
  }
  return []
})

// Helper to build absolute paths for sidebar links (handles empty child paths)
const baseLayoutPath = computed<string>(() => {
  const all = allRoutes()
  const layout = findLayoutRoot(all)
  return layout && layout.path ? String(layout.path) : ''
})

const getFullPath = (parent: AppRoute, child?: AppRoute) => {
  const base = (baseLayoutPath.value || '').replace(/\/$/, '')
  const p = parent && parent.path ? String(parent.path).replace(/^\//, '') : ''
  const c = child && child.path ? String(child.path).replace(/^\//, '') : ''
  const parts: string[] = []
  if (base) parts.push(base)
  if (p) parts.push(p)
  if (c) parts.push(c)
  let full = parts.join('/')
  if (!full) full = '/'
  if (!full.startsWith('/')) full = '/' + full
  return full.replace(/\/+/g, '/')
}

// Return child routes which should be shown in the sidebar (typed helper to avoid implicit any in templates)
const sidebarChildren = (parent: AppRoute) => {
  return (parent.children || []).filter((c) => c.meta?.showInSidebar) as AppRoute[]
}

// Track open/closed state per parent group (keyed by the parent's full path)
const openGroups = ref<Record<string, boolean>>({})

// Keys to temporarily ignore when route changes (prevents reopening after explicit child click)
const skipOpenOnRouteChange = ref(new Set<string>())

// Initialize group open state when sidebarRoutes changes. Default: open if current route is inside the group, else closed.
watch(
  sidebarRoutes,
  () => {
    sidebarRoutes.value.forEach((r) => {
      const key = getFullPath(r)
      if (typeof openGroups.value[key] === 'undefined') {
        // open if current route path starts with this group's path
        openGroups.value[key] = route.path === key || route.path.startsWith(key + '/')
      }
    })
  },
  { immediate: true },
)

// Keep group open state in sync with route changes (covers programmatic navigation)
watch(
  () => route.path,
  (newPath) => {
    Object.keys(openGroups.value).forEach((key) => {
      // If the key is currently flagged to skip reopening (user clicked a child), keep it closed and remove the flag
      if (skipOpenOnRouteChange.value.has(key)) {
        openGroups.value[key] = false
        skipOpenOnRouteChange.value.delete(key)
        return
      }
      openGroups.value[key] = newPath === key || newPath.startsWith(key + '/')
    })
  },
  { immediate: true },
)

const toggleGroup = (key: string) => {
  openGroups.value[key] = !openGroups.value[key]
}

// When a child menu item is clicked, collapse its parent group
const onChildClick = (parentKey: string) => {
  // mark this parent to be skipped on the very next route change so it stays collapsed
  skipOpenOnRouteChange.value.add(parentKey)
  openGroups.value[parentKey] = false
}

// Safe accessors to avoid template type-check errors
const iconOf = (r?: AppRoute) => {
  return r && r.meta && r.meta.icon ? String(r.meta.icon) : undefined
}
const titleOf = (r?: AppRoute) => {
  return r && r.meta && r.meta.title ? String(r.meta.title) : ''
}
const badgeOf = (r?: AppRoute) => {
  const b = r?.meta?.badge
  if (b === null || typeof b === 'undefined') return undefined
  if (typeof b === 'string' || typeof b === 'number') return b
  return undefined
}

// Check if route is active
const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Handle logout
const handleLogout = () => {
  console.log('Logout clicked')
  router.push('/auth/login')
}
</script>
