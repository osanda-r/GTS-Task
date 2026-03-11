<template>
  <v-app-bar elevation="0" border="b" color="white" height="64">
    <!-- Left Section: Menu Icon and Breadcrumb -->
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>

    <div class="d-flex align-center gap-2 ml-2">
      <v-btn variant="text" color="grey-darken-2" class="text-none" @click="goHome">
        <v-icon start>mdi-home-outline</v-icon>
        Home
      </v-btn>

      <template v-if="currentPageTitle">
        <v-icon size="small" color="grey">mdi-chevron-right</v-icon>
        <span class="text-grey-darken-1">{{ currentPageTitle }}</span>
      </template>
    </div>

    <v-spacer></v-spacer>

    <!-- Right Section: Actions and User Menu -->
    <div class="d-flex align-center gap-1">
      <!-- Notifications -->
      <v-menu
        v-model="isNotificationMenuOpen"
        location="bottom end"
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon variant="text" @click="onNotificationMenuOpen">
            <v-badge
              :model-value="unreadCount > 0"
              :content="unreadCount > 99 ? '99+' : unreadCount"
              color="error"
              offset-x="8"
              offset-y="8"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>

        <v-card min-width="360" max-width="420" class="notification-card">
          <v-card-title class="d-flex align-center justify-space-between py-3">
            <span class="text-subtitle-1 font-weight-bold">Notifications</span>
            <div class="d-flex align-center ga-1">
              <v-btn
                icon="mdi-refresh"
                size="small"
                variant="text"
                :loading="isLoadingNotifications"
                @click="loadNotifications"
              ></v-btn>
              <v-btn
                variant="text"
                size="small"
                color="primary"
                :disabled="unreadCount === 0"
                @click="markAllAsRead"
              >
                Mark all read
              </v-btn>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-0">
            <div v-if="isLoadingNotifications" class="pa-4 text-center text-medium-emphasis">
              Loading notifications...
            </div>

            <div
              v-else-if="notifications.length === 0"
              class="pa-4 text-center text-medium-emphasis"
            >
              No notifications yet.
            </div>

            <v-list v-else lines="two" density="comfortable">
              <v-list-item
                v-for="note in notifications"
                :key="note.id"
                class="notification-item"
                @click="openNotification(note)"
              >
                <template v-slot:prepend>
                  <v-avatar
                    size="32"
                    :color="note.type === 'goods' ? 'success' : 'primary'"
                    variant="tonal"
                  >
                    <v-icon size="18">{{
                      note.type === 'goods' ? 'mdi-truck-delivery-outline' : 'mdi-account-plus'
                    }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium d-flex align-center">
                  {{ note.title }}
                  <v-chip
                    v-if="note.isUnread"
                    size="x-small"
                    color="error"
                    variant="flat"
                    class="ml-2"
                  >
                    New
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ note.message }} • {{ note.timeLabel }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>

      <!-- User Profile Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none ml-2" style="text-transform: none">
            <v-avatar color="primary" size="40" class="mr-2">
              <span class="text-white font-weight-medium">{{ userInitials }}</span>
            </v-avatar>
            <span class="mr-1">{{ userName }}</span>
            <v-icon size="small">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="goToProfile">
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>

          <v-list-item @click="goToSettings">
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore'
import useAuth from '@/composables/useAuth'
import { auth, db } from '@/plugins/firebase'

const route = useRoute()
const router = useRouter()
const { logout: authLogout } = useAuth()

type NotificationType = 'goods' | 'user'

type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAtMs: number
  timeLabel: string
  routeName: 'GoodsReceived' | 'Users'
  isUnread: boolean
}

const notifications = ref<NotificationItem[]>([])
const isLoadingNotifications = ref(false)
const isNotificationMenuOpen = ref(false)
const lastReadAtMs = ref(0)

const notificationStorageKey = computed(() => {
  const uid = auth.currentUser?.uid || 'guest'
  return `gts_last_read_notifications_${uid}`
})

const unreadCount = computed(() => {
  return notifications.value.filter((n) => n.isUnread).length
})

// Get current page title from route meta
const currentPageTitle = computed(() => {
  return (route.meta.title as string) || (route.name as string) || ''
})

// get user name and initials for avatar
const userName = computed(() => {
  const currentUser = auth.currentUser
  if (!currentUser) return 'User'
  return currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
})
const userInitials = computed(() => {
  const currentUser = auth.currentUser
  if (!currentUser) return 'U'

  const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
  const parts = name.trim().split(' ')

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const toMillis = (value: unknown): number => {
  if (!value) return 0
  if (value instanceof Timestamp) return value.toMillis()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string') {
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

const toRelativeTime = (ms: number): string => {
  if (!ms) return 'Unknown time'

  const diff = Date.now() - ms
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-US').format(new Date(ms))
}

const mapNotificationsWithUnread = (
  items: Omit<NotificationItem, 'isUnread'>[],
): NotificationItem[] => {
  return items.map((item) => ({
    ...item,
    isUnread: item.createdAtMs > lastReadAtMs.value,
  }))
}

const loadNotifications = async () => {
  isLoadingNotifications.value = true
  try {
    const goodsQuery = query(
      collection(db, 'goodsReceived'),
      orderBy('createdAt', 'desc'),
      limit(5),
    )
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))

    const [goodsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(goodsQuery),
      getDocs(usersQuery),
    ])

    const goodsNotifications: Array<Omit<NotificationItem, 'isUnread'>> = goodsSnapshot.docs.map(
      (row) => {
        const data = row.data()
        const createdAtMs = toMillis(data.createdAt)
        const grn = String(data.grn ?? 'N/A')

        return {
          id: `goods_${row.id}`,
          type: 'goods',
          title: 'New Goods Received',
          message: `GRN: ${grn}`,
          createdAtMs,
          timeLabel: toRelativeTime(createdAtMs),
          routeName: 'GoodsReceived',
        }
      },
    )

    const userNotifications: Array<Omit<NotificationItem, 'isUnread'>> = usersSnapshot.docs.map(
      (row) => {
        const data = row.data()
        const createdAtMs = toMillis(data.createdAt)
        const name = String(data.name ?? data.email ?? 'User')

        return {
          id: `user_${row.id}`,
          type: 'user',
          title: 'New User Added',
          message: name,
          createdAtMs,
          timeLabel: toRelativeTime(createdAtMs),
          routeName: 'Users',
        }
      },
    )

    const merged = [...goodsNotifications, ...userNotifications]
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 10)

    notifications.value = mapNotificationsWithUnread(merged)
  } catch (error) {
    console.error('Failed to load notifications:', error)
    notifications.value = []
  } finally {
    isLoadingNotifications.value = false
  }
}

const markAllAsRead = () => {
  const now = Date.now()
  lastReadAtMs.value = now
  localStorage.setItem(notificationStorageKey.value, String(now))
  notifications.value = notifications.value.map((item) => ({ ...item, isUnread: false }))
}

const onNotificationMenuOpen = () => {
  if (!notifications.value.length) {
    loadNotifications()
  }
}

const openNotification = (notification: NotificationItem) => {
  router.push({ name: notification.routeName })
  isNotificationMenuOpen.value = false
}

// Emit event to parent for drawer toggle
const emit = defineEmits(['toggle-drawer'])

const toggleDrawer = () => {
  emit('toggle-drawer')
}

const goHome = () => {
  router.push({ name: 'Dashboard' })
}

const goToProfile = () => {
  console.log('Navigate to profile')
  // Add your navigation logic here
}

const goToSettings = () => {
  console.log('Navigate to settings')
  // Add your navigation logic here
}

const logout = async () => {
  await authLogout()
}

onMounted(() => {
  const saved = localStorage.getItem(notificationStorageKey.value)
  const parsed = Number(saved)
  lastReadAtMs.value = Number.isFinite(parsed) ? parsed : 0
  loadNotifications()
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.notification-card {
  max-height: 500px;
  overflow: hidden;
}

.notification-item {
  cursor: pointer;
}
</style>
