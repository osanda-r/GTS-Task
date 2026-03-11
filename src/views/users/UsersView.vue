<template>
  <v-container fluid class="users-page">
    <PageHeader title="Users" subtitle="Manage user accounts and roles" container-class="mb-4">
      <template #actions v-if="canCreate">
        <v-btn color="success" prepend-icon="mdi-account-plus" @click="addNewUser">
          Add New User
        </v-btn>
      </template>
    </PageHeader>

    <AppTableCard card-class="table-card">
      <template #toolbar>
        <UserTableToolbar
          :search="search"
          :record-count="users.length"
          :is-loading="loading"
          @update:search="search = $event"
          @refresh="loadUsers"
          @export="handleExport"
          @import="handleImport"
        />
      </template>

      <template #table>
        <AppDataTable
          :headers="headers"
          :items="filteredUsers"
          :loading="loading"
          :items-per-page="10"
          item-value="id"
          table-class="users-table"
          no-data-text="No users found"
        >
          <template v-slot:[`mobile-card`]="{ item }">
            <v-card class="mobile-user-card mb-3" variant="outlined">
              <v-card-text>
                <div class="d-flex align-center justify-space-between ga-3 mb-3">
                  <div class="d-flex align-center ga-3">
                    <v-avatar color="primary" size="40">
                      <span class="text-white">{{ asUserRecord(item).initials }}</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ asUserRecord(item).name }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ asUserRecord(item).email }}
                      </div>
                    </div>
                  </div>
                  <v-chip
                    :color="asUserRecord(item).status === 'Active' ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                  >
                    {{ asUserRecord(item).status }}
                  </v-chip>
                </div>

                <div class="mobile-user-meta mb-3">
                  <div>
                    <div class="text-caption text-medium-emphasis">Role</div>
                    <div class="text-body-2">{{ asUserRecord(item).role }}</div>
                  </div>
                </div>

                <div class="pt-2 border-top-thin d-flex justify-end">
                  <UserActionButtons
                    :can-view="true"
                    :can-edit="canEdit"
                    :can-delete="canDelete"
                    @view="viewUser(asUserRecord(item))"
                    @edit="editUser(asUserRecord(item))"
                    @delete="deleteUser()"
                  />
                </div>
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:[`item.avatar`]="{ item }">
            <v-avatar color="primary" size="32">
              <span class="text-white">{{ asUserRecord(item).initials }}</span>
            </v-avatar>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              :color="asUserRecord(item).status === 'Active' ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ asUserRecord(item).status }}
            </v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <UserActionButtons
              :can-view="true"
              :can-edit="canEdit"
              :can-delete="canDelete"
              @view="viewUser(asUserRecord(item))"
              @edit="editUser(asUserRecord(item))"
              @delete="deleteUser()"
            />
          </template>
        </AppDataTable>
      </template>
    </AppTableCard>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore'
import { auth, db } from '@/plugins/firebase'
import router from '@/router'
import PageHeader from '@/component/common/PageHeader.vue'
import AppDataTable from '@/component/common/AppDataTable.vue'
import AppTableCard from '@/component/common/AppTableCard.vue'
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
  createdAt?: Timestamp | string
}

const asUserRecord = (value: unknown): UserRecord => value as UserRecord

const userPermissions = ref<string[]>([])
const userRole = ref<string>('')
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

const isAdministrator = computed(() => userRole.value.toLowerCase() === 'administrator')
const canCreate = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.users.create'),
)
const canEdit = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.users.edit'),
)
const canDelete = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.users.delete'),
)

const loadUserPermissions = async () => {
  try {
    if (!auth.currentUser?.uid) {
      userPermissions.value = []
      return
    }

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (!userDoc.exists()) {
      userPermissions.value = []
      return
    }

    const roleName = String(userDoc.data().role ?? '').trim()
    userRole.value = roleName

    if (roleName.toLowerCase() === 'administrator') {
      userPermissions.value = [
        'page.users.view',
        'page.users.create',
        'page.users.edit',
        'page.users.delete',
      ]
      return
    }

    const roleSnapshot = await getDocs(
      query(collection(db, 'roles'), where('name', '==', roleName)),
    )
    const roleDoc = roleSnapshot.docs[0]
    userPermissions.value = Array.isArray(roleDoc?.data().permissions)
      ? roleDoc.data().permissions.map((p: unknown) => String(p))
      : []
  } catch (error) {
    console.error('Failed to load user permissions:', error)
    userPermissions.value = []
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

onMounted(async () => {
  await loadUserPermissions()
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

.mobile-user-card {
  background: #fff;
  border-color: #d8dee3;
}

.mobile-user-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 600px) {
  .mobile-user-meta {
    grid-template-columns: 1fr;
  }
}
</style>
