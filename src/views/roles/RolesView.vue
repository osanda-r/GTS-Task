<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4 font-weight-bold">Roles & Permissions</h1>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Add New Role
          </v-btn>
        </div>

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
                    <v-list-item @click="editRole(role)">
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteRole(role)">
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
                    {{ permission }}
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

          <v-combobox
            v-model="roleForm.permissions"
            :items="permissionOptions"
            label="Permissions"
            variant="outlined"
            prepend-inner-icon="mdi-key-variant"
            chips
            multiple
            clearable
            closable-chips
            hint="Type and press Enter to add permissions"
            persistent-hint
          ></v-combobox>
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
import { onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
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

const roleForm = ref({
  name: '',
  permissions: [] as string[],
})

const permissionOptions = [
  'page.dashboard.view',
  'page.goods_received.view',
  'page.users.view',
  'page.users.create',
  'page.roles.manage',
]

const normalizeRoleKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_')

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
  roleDialog.value = true
}

const editRole = (role: Role) => {
  editingRoleId.value = role.id
  originalRoleName.value = role.name
  roleForm.value = {
    name: role.name,
    permissions: [...role.permissions],
  }
  roleDialog.value = true
}

const closeDialog = () => {
  roleDialog.value = false
}

const roleNameExists = async (name: string, excludeId?: string) => {
  const snapshot = await getDocs(query(collection(db, 'roles'), where('name', '==', name)))
  if (excludeId) {
    return snapshot.docs.some((row) => row.id !== excludeId)
  }
  return !snapshot.empty
}

const saveRole = async () => {
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
</style>
