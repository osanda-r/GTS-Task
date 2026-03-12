<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <PageHeader title="Roles & Permissions">
          <template #actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              :disabled="!canCreate"
              :title="!canCreate ? 'You do not have permission to create roles' : ''"
              @click="openCreateDialog"
            >
              Add New Role
            </v-btn>
          </template>
        </PageHeader>

        <v-row>
          <v-col v-if="isLoading" cols="12">
            <v-alert type="info" variant="tonal">Loading roles...</v-alert>
          </v-col>

          <v-col v-else-if="roles.length === 0" cols="12">
            <v-alert type="warning" variant="tonal">
              No roles found. Add a role from here or from Add New User page.
            </v-alert>
          </v-col>

          <v-col v-for="role in roles" :key="role.id" cols="12" md="6" lg="4">
            <v-card class="role-card" elevation="2">
              <v-card-title class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-shield-account</v-icon>
                  <span>{{ role.name }}</span>
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      :disabled="!canEdit"
                      :title="!canEdit ? 'You do not have permission to edit roles' : ''"
                      @click="editRole(role)"
                    >
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      :disabled="!canDelete"
                      :title="!canDelete ? 'You do not have permission to delete roles' : ''"
                      @click="deleteRole(role)"
                    >
                      <template v-slot:prepend>
                        <v-icon>mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>

              <v-card-text>
                <p class="text-caption text-grey mb-3">
                  Manage permissions for <strong>{{ role.name }}</strong>
                </p>

                <div class="mb-3">
                  <p class="text-caption font-weight-bold mb-1">Users with this role</p>
                  <v-chip size="small" color="primary">{{ role.userCount }} users</v-chip>
                </div>

                <div>
                  <p class="text-caption font-weight-bold mb-2">Permissions:</p>
                  <v-chip
                    v-for="permission in role.permissions"
                    :key="permission"
                    size="small"
                    class="mr-1 mb-1"
                    variant="outlined"
                  >
                    {{ getPermissionLabel(permission) }}
                  </v-chip>
                  <span v-if="role.permissions.length === 0" class="text-caption text-grey">
                    No permissions assigned.
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="roleDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6">
          {{ editingRoleId ? 'Edit Role & Permissions' : 'Add New Role' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="roleForm.name"
            label="Role Name"
            variant="outlined"
            prepend-inner-icon="mdi-shield-account"
            density="comfortable"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="permissionSearch"
            label="Search Permissions"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
            clearable
            class="mb-3"
            hint="Search by page, action, or permission key"
            persistent-hint
          ></v-text-field>

          <div class="mb-3">
            <div class="text-caption font-weight-bold mb-2">Selected Permissions</div>
            <div v-if="roleForm.permissions.length" class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="permission in roleForm.permissions"
                :key="permission"
                size="small"
                closable
                color="primary"
                variant="tonal"
                @click:close="togglePermission(permission)"
              >
                {{ getPermissionLabel(permission) }}
              </v-chip>
            </div>
            <div v-else class="text-caption text-grey">No permissions selected.</div>
          </div>

          <div class="permission-picker">
            <div
              v-for="group in filteredPermissionGroups"
              :key="group.title"
              class="permission-group mb-4"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <div class="text-subtitle-2 font-weight-bold">{{ group.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ group.description }}</div>
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="togglePermissionGroup(group.permissions)"
                >
                  {{ areAllPermissionsSelected(group.permissions) ? 'Clear' : 'Select all' }}
                </v-btn>
              </div>

              <v-list class="permission-list" density="compact" rounded="lg" border>
                <v-list-item
                  v-for="permission in group.permissions"
                  :key="permission.value"
                  @click="togglePermission(permission.value)"
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="roleForm.permissions.includes(permission.value)"
                    ></v-checkbox-btn>
                  </template>

                  <v-list-item-title>{{ permission.label }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ permission.description }}
                  </v-list-item-subtitle>

                  <template #append>
                    <span class="text-caption text-medium-emphasis permission-key">
                      {{ permission.value }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <div v-if="filteredPermissionGroups.length === 0" class="text-caption text-grey">
              No permissions matched your search.
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="isSaving" @click="saveRole"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/component/common/PageHeader.vue'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '@/plugins/firebase'

interface Role {
  id: string
  name: string
  userCount: number
  permissions: string[]
}

interface PermissionOption {
  value: string
  label: string
  description: string
}

interface PermissionGroup {
  title: string
  description: string
  permissions: PermissionOption[]
}

const roles = ref<Role[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const roleDialog = ref(false)
const editingRoleId = ref<string | null>(null)
const originalRoleName = ref('')
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

const userPermissions = ref<string[]>([])
const userRole = ref<string>('')

const roleForm = ref({
  name: '',
  permissions: [] as string[],
})
const permissionSearch = ref('')

const permissionGroups: PermissionGroup[] = [
  {
    title: 'Dashboard',
    description: 'Access the main dashboard page.',
    permissions: [
      {
        value: 'page.dashboard.view',
        label: 'View Dashboard',
        description: 'Show the dashboard in navigation and allow opening it.',
      },
    ],
  },
  {
    title: 'Products',
    description: 'Control product creation features.',
    permissions: [
      {
        value: 'page.products.create',
        label: 'Create Products',
        description: 'Show Add Product actions and allow opening the Add Product page.',
      },
    ],
  },
  {
    title: 'Goods Received',
    description: 'Manage received goods records.',
    permissions: [
      {
        value: 'page.goods_received.view',
        label: 'View Goods Received',
        description: 'Show Goods Received in navigation and allow viewing records.',
      },
      {
        value: 'page.goods_received.create',
        label: 'Create Goods Received',
        description: 'Allow adding new goods received records.',
      },
      {
        value: 'page.goods_received.edit',
        label: 'Edit Goods Received',
        description: 'Allow updating goods received records.',
      },
      {
        value: 'page.goods_received.delete',
        label: 'Delete Goods Received',
        description: 'Allow deleting goods received records.',
      },
    ],
  },
  {
    title: 'Users',
    description: 'Manage user accounts.',
    permissions: [
      {
        value: 'page.users.view',
        label: 'View Users',
        description: 'Show Users in navigation and allow viewing users.',
      },
      {
        value: 'page.users.create',
        label: 'Create Users',
        description: 'Allow adding new users.',
      },
      {
        value: 'page.users.edit',
        label: 'Edit Users',
        description: 'Allow updating user details.',
      },
      {
        value: 'page.users.delete',
        label: 'Delete Users',
        description: 'Allow removing users.',
      },
    ],
  },
  {
    title: 'Roles',
    description: 'Manage roles and permissions.',
    permissions: [
      {
        value: 'page.roles.view',
        label: 'View Roles',
        description: 'Show Roles in navigation and allow viewing roles.',
      },
      {
        value: 'page.roles.create',
        label: 'Create Roles',
        description: 'Allow creating new roles.',
      },
      {
        value: 'page.roles.edit',
        label: 'Edit Roles',
        description: 'Allow updating role names and permissions.',
      },
      {
        value: 'page.roles.delete',
        label: 'Delete Roles',
        description: 'Allow deleting roles that are not assigned to users.',
      },
    ],
  },
]

const filteredPermissionGroups = computed(() => {
  const search = permissionSearch.value.trim().toLowerCase()

  if (!search) {
    return permissionGroups
  }

  return permissionGroups
    .map((group) => {
      const permissions = group.permissions.filter((permission) => {
        const text = [group.title, permission.label, permission.description, permission.value]
          .join(' ')
          .toLowerCase()

        return text.includes(search)
      })

      return {
        ...group,
        permissions,
      }
    })
    .filter((group) => group.permissions.length > 0)
})

const permissionLookup = new Map(
  permissionGroups.flatMap((group) =>
    group.permissions.map((permission) => [permission.value, permission.label] as const),
  ),
)

//Permission checks
const isAdministrator = computed(() => userRole.value.toLowerCase() === 'administrator')
const canCreate = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.roles.create'),
)
const canEdit = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.roles.edit'),
)
const canDelete = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.roles.delete'),
)

const getPermissionLabel = (value: string) => permissionLookup.get(value) ?? value

const togglePermission = (value: string) => {
  if (roleForm.value.permissions.includes(value)) {
    roleForm.value.permissions = roleForm.value.permissions.filter(
      (permission) => permission !== value,
    )
    return
  }

  roleForm.value.permissions = [...roleForm.value.permissions, value]
}

const areAllPermissionsSelected = (permissions: PermissionOption[]) => {
  return permissions.every((permission) => roleForm.value.permissions.includes(permission.value))
}

const togglePermissionGroup = (permissions: PermissionOption[]) => {
  if (areAllPermissionsSelected(permissions)) {
    roleForm.value.permissions = roleForm.value.permissions.filter(
      (permission) => !permissions.some((item) => item.value === permission),
    )
    return
  }

  const next = new Set(roleForm.value.permissions)
  permissions.forEach((permission) => next.add(permission.value))
  roleForm.value.permissions = [...next]
}

const normalizeRoleKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_')

const loadUserPermissions = async () => {
  try {
    if (!auth.currentUser) return

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (!userDoc.exists()) {
      userPermissions.value = []
      return
    }

    const roleName = String(userDoc.data().role ?? '').trim()
    userRole.value = roleName

    if (roleName.toLowerCase() === 'administrator') {
      userPermissions.value = [
        'page.roles.view',
        'page.roles.create',
        'page.roles.edit',
        'page.roles.delete',
      ]
      return
    }

    const roleSnapshot = await getDocs(
      query(collection(db, 'roles'), where('name', '==', roleName)),
    )
    const roleDoc = roleSnapshot.docs[0]
    const permissions = Array.isArray(roleDoc?.data().permissions)
      ? roleDoc.data().permissions.map((p: unknown) => String(p))
      : []

    userPermissions.value = permissions
  } catch (error) {
    console.error('Failed to load permissions:', error)
    userPermissions.value = []
  }
}

const notify = (text: string, color: 'success' | 'error' | 'warning' | 'info') => {
  snackbar.value = { show: true, text, color }
}

const loadRoles = async () => {
  isLoading.value = true
  try {
    const [rolesSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, 'roles')),
      getDocs(collection(db, 'users')),
    ])

    const userCountMap = new Map<string, number>()
    usersSnapshot.docs.forEach((row) => {
      const roleName = String(row.data().role ?? '').trim()
      if (!roleName) return
      userCountMap.set(roleName, (userCountMap.get(roleName) ?? 0) + 1)
    })

    const mappedRoles = rolesSnapshot.docs.map((row) => {
      const data = row.data()
      const name = String(data.name ?? '').trim()
      const permissions = Array.isArray(data.permissions)
        ? data.permissions.map((p) => String(p).trim()).filter(Boolean)
        : []

      return {
        id: row.id,
        name,
        permissions,
        userCount: userCountMap.get(name) ?? 0,
      }
    })

    roles.value = mappedRoles.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Failed to load roles:', error)
  } finally {
    isLoading.value = false
  }
}

const openCreateDialog = () => {
  editingRoleId.value = null
  originalRoleName.value = ''
  roleForm.value = { name: '', permissions: [] }
  permissionSearch.value = ''
  roleDialog.value = true
}

const editRole = (role: Role) => {
  editingRoleId.value = role.id
  originalRoleName.value = role.name
  roleForm.value = {
    name: role.name,
    permissions: [...role.permissions],
  }
  permissionSearch.value = ''
  roleDialog.value = true
}

const closeDialog = () => {
  roleDialog.value = false
  permissionSearch.value = ''
}

const roleNameExists = async (name: string, excludeId?: string) => {
  const snapshot = await getDocs(query(collection(db, 'roles'), where('name', '==', name)))
  if (excludeId) {
    return snapshot.docs.some((row) => row.id !== excludeId)
  }
  return !snapshot.empty
}

const saveRole = async () => {
  // Check permissions
  if (editingRoleId.value && !canEdit.value) {
    notify('You do not have permission to edit roles.', 'error')
    return
  }
  if (!editingRoleId.value && !canCreate.value) {
    notify('You do not have permission to create roles.', 'error')
    return
  }

  const name = roleForm.value.name.trim()
  if (!name) return

  const permissions = roleForm.value.permissions
    .map((p) => String(p).trim())
    .filter((p) => Boolean(p))

  isSaving.value = true
  try {
    if (editingRoleId.value) {
      const exists = await roleNameExists(name, editingRoleId.value)
      if (exists) {
        notify('Role name already exists.', 'warning')
        return
      }

      const oldName = originalRoleName.value
      await setDoc(
        doc(db, 'roles', editingRoleId.value),
        {
          name,
          permissions,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.uid || 'admin',
        },
        { merge: true },
      )

      if (oldName && oldName !== name) {
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', oldName)),
        )
        const batch = writeBatch(db)
        usersSnapshot.docs.forEach((row) => {
          batch.update(row.ref, { role: name })
        })
        await batch.commit()
      }

      notify('Role updated successfully.', 'success')
    } else {
      const exists = await roleNameExists(name)
      if (exists) {
        notify('Role name already exists.', 'warning')
        return
      }

      const roleId = normalizeRoleKey(name)
      await setDoc(doc(db, 'roles', roleId), {
        name,
        permissions,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'admin',
      })

      notify('Role created successfully.', 'success')
    }

    closeDialog()
    await loadRoles()
  } catch (error) {
    console.error('Failed to save role:', error)
    notify('Failed to save role.', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteRole = async (role: Role) => {
  if (!canDelete.value) {
    notify('You do not have permission to delete roles.', 'error')
    return
  }

  if (role.userCount > 0) {
    notify('Cannot delete role that is assigned to users.', 'warning')
    return
  }

  try {
    await deleteDoc(doc(db, 'roles', role.id))
    notify('Role deleted.', 'success')
    await loadRoles()
  } catch (error) {
    console.error('Failed to delete role:', error)
    notify('Failed to delete role.', 'error')
  }
}

onMounted(() => {
  loadUserPermissions()
  loadRoles()
})
</script>

<style scoped>
.role-card {
  transition: transform 0.2s;
}

.role-card:hover {
  transform: translateY(-4px);
}

.permission-picker {
  max-height: 420px;
  overflow-y: auto;
}

.permission-list {
  background: #fafafa;
}

.permission-key {
  max-width: 180px;
  text-align: right;
  white-space: normal;
}
</style>
