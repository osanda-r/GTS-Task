<template>
  <v-app-bar elevation="0" border="b" color="white" height="64">
    <!-- menu icon -->
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>

    <div class="d-none d-sm-flex align-center gap-2 ml-2">
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

    <!-- actions and user menu -->
    <div class="d-flex align-center gap-1">
      <NotificationsDropdown
        :is-menu-open="isNotificationMenuOpen"
        :notifications="notifications"
        :is-loading="isLoadingNotifications"
        @update:is-menu-open="isNotificationMenuOpen = $event"
        @refresh="loadNotifications"
        @mark-all-read="markAllAsRead"
      />

      <!-- profile menu -->
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import useAuth from '@/composables/useAuth'
import { auth, db } from '@/plugins/firebase'
import NotificationsDropdown from '@/component/NotificationsDropdown.vue'

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
let unsubscribeGoods: (() => void) | null = null
let unsubscribeUsers: (() => void) | null = null
let unsubscribeProducts: (() => void) | null = null

const notificationStorageKey = computed(() => {
  const uid = auth.currentUser?.uid || 'guest'
  return `gts_last_read_notifications_${uid}`
})

// get current page title
const currentPageTitle = computed(() => {
  return (route.meta.title as string) || (route.name as string) || ''
})

// get user name
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

const mergeAndUpdateNotifications = (
  goodsDocs: Array<Omit<NotificationItem, 'isUnread'>>,
  userDocs: Array<Omit<NotificationItem, 'isUnread'>>,
) => {
  const merged = [...goodsDocs, ...userDocs]
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 10)
  notifications.value = mapNotificationsWithUnread(merged)
}

const subscribeToNotifications = () => {
  try {
    const goodsQuery = query(
      collection(db, 'goodsReceived'),
      orderBy('createdAt', 'desc'),
      limit(5),
    )
    unsubscribeGoods = onSnapshot(
      goodsQuery,
      (snapshot) => {
        const goodsNotifications: Array<Omit<NotificationItem, 'isUnread'>> = snapshot.docs.map(
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

        const currentUserNotifications = notifications.value.filter((n) => n.type === 'user')
        mergeAndUpdateNotifications(
          goodsNotifications,
          currentUserNotifications as Array<Omit<NotificationItem, 'isUnread'>>,
        )
      },
      (error) => {
        console.error('Failed to subscribe to goods notifications:', error)
      },
    )

    // users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))
    unsubscribeUsers = onSnapshot(
      usersQuery,
      (snapshot) => {
        const userNotifications: Array<Omit<NotificationItem, 'isUnread'>> = snapshot.docs.map(
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

        const currentGoodsNotifications = notifications.value.filter((n) => n.type === 'goods')
        mergeAndUpdateNotifications(
          currentGoodsNotifications as Array<Omit<NotificationItem, 'isUnread'>>,
          userNotifications,
        )
      },
      (error) => {
        console.error('Failed to subscribe to user notifications:', error)
      },
    )
  } catch (error) {
    console.error('Failed to set up notification subscriptions:', error)
  }
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

//drawer toggle
const emit = defineEmits(['toggle-drawer'])

const toggleDrawer = () => {
  emit('toggle-drawer')
}

const goHome = () => {
  router.push({ name: 'Dashboard' })
}

const goToProfile = () => {
  router.push({ name: 'Profile' })
}

const logout = async () => {
  await authLogout()
}

onMounted(() => {
  const saved = localStorage.getItem(notificationStorageKey.value)
  const parsed = Number(saved)
  lastReadAtMs.value = Number.isFinite(parsed) ? parsed : 0
  subscribeToNotifications()
})

onBeforeUnmount(() => {
  if (unsubscribeGoods) {
    unsubscribeGoods()
    unsubscribeGoods = null
  }
  if (unsubscribeUsers) {
    unsubscribeUsers()
    unsubscribeUsers = null
  }
  if (unsubscribeProducts) {
    unsubscribeProducts()
    unsubscribeProducts = null
  }
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>
