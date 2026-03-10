<template>
  <v-container fluid class="users-page">
    <PageHeader title="Users" subtitle="Manage user accounts and roles" container-class="mb-4">
      <template #actions>
        <v-btn color="success" prepend-icon="mdi-account-plus" @click="addNewUser">
          Add New User
        </v-btn>
      </template>
    </PageHeader>

    <v-card class="table-card" elevation="2" rounded="lg">
      <v-card-text class="px-0 py-0">
        <UserTableToolbar
          :search="search"
          :record-count="users.length"
          :is-loading="loading"
          @update:search="search = $event"
          @refresh="loadUsers"
          @export="handleExport"
          @import="handleImport"
        />

        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :loading="loading"
          :items-per-page="10"
          item-value="id"
          class="users-table"
          no-data-text="No users found"
        >
          <template v-slot:[`item.avatar`]="{ item }">
            <v-avatar color="primary" size="32">
              <span class="text-white">{{ item.initials }}</span>
            </v-avatar>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              :color="item.status === 'Active' ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <UserActionButtons
              :can-view="true"
              :can-edit="true"
              :can-delete="true"
              @view="viewUser(item)"
              @edit="editUser(item)"
              @delete="deleteUser()"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import router from '@/router'
import PageHeader from '@/component/common/PageHeader.vue'
import UserTableToolbar from '@/component/users/UserTableToolbar.vue'
import UserActionButtons from '@/component/users/UserActionButtons.vue'
import type { Timestamp } from 'firebase/firestore'

interface UserRecord {
  id: string
  uid: string
  name: string
  initials: string
  email: string
  role: string
  status: string
  lastLogin?: string
  createdAt?: Timestamp | string
}

const search = ref('')
const loading = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

const showToast = (text: string, color: 'success' | 'error' | 'warning' | 'info') => {
  snackbar.value = {
    show: true,
    text,
    color,
  }
}

const addNewUser = () => {
  router.push({ name: 'AddUser' })
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const viewUser = (user: UserRecord) => {
  showToast(`Viewing user: ${user.name}`, 'info')
}

const editUser = (user: UserRecord) => {
  router.push({ name: 'AddUser', params: { id: user.id } })
}

const deleteUser = () => {
  showToast('Delete functionality coming soon.', 'info')
}

const handleExport = () => {
  showToast('Export functionality coming soon.', 'info')
}

const handleImport = () => {
  showToast('Import functionality coming soon.', 'info')
}

const headers = [
  { title: '', key: 'avatar', sortable: false },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const users = ref<UserRecord[]>([])

const filteredUsers = computed(() => {
  const queryTerm = search.value.trim().toLowerCase()
  if (!queryTerm) return users.value

  return users.value.filter((user) => {
    return Object.values(user).some((value) => String(value).toLowerCase().includes(queryTerm))
  })
})

const loadUsers = async () => {
  loading.value = true
  try {
    const usersCollection = collection(db, 'users')
    const q = query(usersCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    users.value = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        uid: data.uid || doc.id,
        name: data.name || '',
        initials: getInitials(data.name || ''),
        email: data.email || '',
        role: data.role || 'User',
        status: data.status || 'Active',
        lastLogin: data.lastLogin || '-',
        createdAt: data.createdAt,
      }
    })
  } catch (error) {
    console.error('Failed to load users:', error)
    showToast('Failed to load users.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  min-height: calc(100vh - 64px);
  padding: 22px;
}

.table-card {
  background: #f3f4f6;
}

.users-table :deep(.v-data-table__th) {
  background: #fff;
  color: #37474f;
  font-size: 15px;
  font-weight: 600;
}

.users-table :deep(tbody tr) {
  border-bottom: 1px solid #e3e7ea;
}

.users-table :deep(tbody tr:hover) {
  background: #f9f9f9;
}
</style>
