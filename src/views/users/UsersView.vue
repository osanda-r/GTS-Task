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
          :show-export-import="canExportImport"
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
                    @view="openViewDialog(asUserRecord(item))"
                    @edit="openEditDialog(asUserRecord(item))"
                    @delete="openDeleteDialog(asUserRecord(item))"
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
              @view="openViewDialog(asUserRecord(item))"
              @edit="openEditDialog(asUserRecord(item))"
              @delete="openDeleteDialog(asUserRecord(item))"
            />
          </template>
        </AppDataTable>
      </template>
    </AppTableCard>

    <UserViewDialog v-model="isViewDialogOpen" :user="selectedUser" />

    <UserEditDialog
      v-model="isEditDialogOpen"
      :form="editForm"
      :is-updating="isUpdating"
      :role-options="roleOptions"
      :status-options="statusOptions"
      @update:form="editForm = $event"
      @save="saveUserEdits"
    />

    <UserDeleteDialog
      v-model="isDeleteDialogOpen"
      :user-name="selectedUser?.name ?? ''"
      :is-deleting="isDeleting"
      @confirm="confirmDeleteUser"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore'
import { auth, db } from '@/plugins/firebase'
import router from '@/router'
import PageHeader from '@/component/common/PageHeader.vue'
import AppDataTable from '@/component/common/AppDataTable.vue'
import AppTableCard from '@/component/common/AppTableCard.vue'
import UserTableToolbar from '@/component/users/UserTableToolbar.vue'
import UserActionButtons from '@/component/users/UserActionButtons.vue'
import UserDeleteDialog from '@/component/users/UserDeleteDialog.vue'
import UserEditDialog from '@/component/users/UserEditDialog.vue'
import UserViewDialog from '@/component/users/UserViewDialog.vue'
import {
  exportExcelFile,
  getCellValue,
  pickExcelFile,
  readExcelFile,
} from '@/helpers/utils/excelUtils'
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
const isUpdating = ref(false)
const isDeleting = ref(false)
const isViewDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedUser = ref<UserRecord | null>(null)
const roleOptions = ref<string[]>([])
const statusOptions = ['Active', 'Inactive']
const editForm = ref({
  id: '',
  name: '',
  role: '',
  status: 'Active',
})
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
const canExportImport = computed(() => canCreate.value || canEdit.value || canDelete.value)

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

const loadRoleOptions = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'roles'))
    roleOptions.value = snapshot.docs
      .map((row) => String(row.data().name ?? '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  } catch (error) {
    console.error('Failed to load role options:', error)
    roleOptions.value = []
  }
}

const openViewDialog = (user: UserRecord) => {
  selectedUser.value = user
  isViewDialogOpen.value = true
}

const openEditDialog = async (user: UserRecord) => {
  if (!canEdit.value) {
    showToast('You do not have permission to edit users.', 'error')
    return
  }

  if (roleOptions.value.length === 0) {
    await loadRoleOptions()
  }

  selectedUser.value = user
  editForm.value = {
    id: user.id,
    name: user.name,
    role: user.role,
    status: user.status,
  }
  isEditDialogOpen.value = true
}

const saveUserEdits = async () => {
  if (!canEdit.value) {
    showToast('You do not have permission to edit users.', 'error')
    return
  }

  const name = editForm.value.name.trim()
  const role = editForm.value.role.trim()
  const status = editForm.value.status.trim()

  if (!editForm.value.id || !name || !role || !status) {
    showToast('Name, role, and status are required.', 'warning')
    return
  }

  if (isUpdating.value) return
  isUpdating.value = true
  try {
    await updateDoc(doc(db, 'users', editForm.value.id), {
      name,
      role,
      status,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid || 'admin',
    })

    users.value = users.value.map((user) => {
      if (user.id !== editForm.value.id) return user
      return {
        ...user,
        name,
        initials: getInitials(name),
        role,
        status,
      }
    })

    isEditDialogOpen.value = false
    showToast('User updated successfully.', 'success')
  } catch (error) {
    console.error('Failed to update user:', error)
    showToast('Failed to update user.', 'error')
  } finally {
    isUpdating.value = false
  }
}

const openDeleteDialog = (user: UserRecord) => {
  if (!canDelete.value) {
    showToast('You do not have permission to delete users.', 'error')
    return
  }

  selectedUser.value = user
  isDeleteDialogOpen.value = true
}

const confirmDeleteUser = async () => {
  if (!canDelete.value) {
    showToast('You do not have permission to delete users.', 'error')
    return
  }

  const user = selectedUser.value
  if (!user?.id) return

  if (isDeleting.value) return
  isDeleting.value = true
  try {
    await deleteDoc(doc(db, 'users', user.id))
    users.value = users.value.filter((row) => row.id !== user.id)
    isDeleteDialogOpen.value = false
    showToast('User deleted successfully.', 'success')
  } catch (error) {
    console.error('Failed to delete user:', error)
    showToast('Failed to delete user.', 'error')
  } finally {
    isDeleting.value = false
  }
}

const handleExport = () => {
  if (!canExportImport.value) {
    showToast('You do not have permission to export users.', 'error')
    return
  }

  try {
    const rows = filteredUsers.value.map((user) => ({
      UID: user.uid,
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Status: user.status,
    }))

    exportExcelFile(rows, 'Users', `users-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showToast('Users exported successfully.', 'success')
  } catch (error) {
    console.error('Failed to export users:', error)
    showToast('Failed to export users.', 'error')
  }
}

const handleImport = async () => {
  if (!canCreate.value && !canEdit.value) {
    showToast('You do not have permission to import users.', 'error')
    return
  }

  try {
    const file = await pickExcelFile()
    if (!file) return

    const rows = await readExcelFile(file)
    if (rows.length === 0) {
      showToast('The selected Excel file has no rows.', 'warning')
      return
    }

    const batch = writeBatch(db)
    let imported = 0

    for (const row of rows) {
      const name = getCellValue(row, ['name', 'full name'])
      const email = getCellValue(row, ['email'])
      const role = getCellValue(row, ['role']) || 'User'
      const status = getCellValue(row, ['status']) || 'Active'
      const uidFromFile = getCellValue(row, ['uid', 'user id', 'id'])

      if (!name || !email) {
        continue
      }

      const userRef = uidFromFile ? doc(db, 'users', uidFromFile) : doc(collection(db, 'users'))
      const uid = uidFromFile || userRef.id

      batch.set(
        userRef,
        {
          uid,
          name,
          email,
          role,
          status,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.uid || 'admin',
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )

      imported += 1
    }

    if (imported === 0) {
      showToast('No valid rows found to import.', 'warning')
      return
    }

    await batch.commit()
    await loadUsers()
    showToast(`Imported ${imported} user record(s) successfully.`, 'success')
  } catch (error) {
    console.error('Failed to import users:', error)
    showToast('Failed to import users.', 'error')
  }
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
  await loadRoleOptions()
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
