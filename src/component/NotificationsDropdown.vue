<template>
  <v-menu
    :model-value="isMenuOpen"
    location="bottom end"
    :close-on-content-click="false"
    @update:model-value="onMenuUpdated"
  >
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon variant="text" @click="onMenuOpened">
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
            :loading="isLoading"
            @click="onRefresh"
          ></v-btn>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            :disabled="unreadCount === 0"
            @click="onMarkAllRead"
          >
            Mark all read
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <div v-if="isLoading" class="pa-4 text-center text-medium-emphasis">
          Loading notifications...
        </div>

        <div v-else-if="notifications.length === 0" class="pa-4 text-center text-medium-emphasis">
          No notifications yet.
        </div>

        <v-list v-else lines="two" density="comfortable">
          <v-list-item v-for="note in notifications" :key="note.id" class="notification-item">
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
              <v-chip v-if="note.isUnread" size="x-small" color="error" variant="flat" class="ml-2">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const props = defineProps<{
  isMenuOpen: boolean
  notifications: NotificationItem[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (event: 'update:isMenuOpen', value: boolean): void
  (event: 'refresh'): void
  (event: 'markAllRead'): void
}>()

const unreadCount = computed(() => {
  return props.notifications.filter((n) => n.isUnread).length
})

const onMenuUpdated = (value: boolean) => {
  emit('update:isMenuOpen', value)
}

const onMenuOpened = () => {
  if (!props.notifications.length) {
    emit('refresh')
  }
}

const onRefresh = () => {
  emit('refresh')
}

const onMarkAllRead = () => {
  emit('markAllRead')
}
</script>

<style scoped>
.notification-card {
  max-height: 500px;
  overflow: hidden;
}
</style>
