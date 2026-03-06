<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4 font-weight-bold">Roles & Permissions</h1>
          <v-btn color="primary" prepend-icon="mdi-plus"> Add New Role </v-btn>
        </div>

        <v-row>
          <v-col v-for="role in roles" :key="role.id" cols="12" md="6" lg="4">
            <v-card class="role-card" elevation="2">
              <v-card-title class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" :color="role.color">{{ role.icon }}</v-icon>
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
                <p class="text-caption text-grey mb-3">{{ role.description }}</p>

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
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Role {
  id: number
  name: string
  description: string
  icon: string
  color: string
  userCount: number
  permissions: string[]
}

const roles = ref<Role[]>([
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    icon: 'mdi-shield-crown',
    color: 'error',
    userCount: 3,
    permissions: ['Create', 'Read', 'Update', 'Delete', 'Manage Users', 'Manage Roles'],
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Can manage products and goods received',
    icon: 'mdi-shield-account',
    color: 'primary',
    userCount: 8,
    permissions: ['Create', 'Read', 'Update', 'Delete', 'View Reports'],
  },
  {
    id: 3,
    name: 'Warehouse Staff',
    description: 'Can manage inventory and goods received',
    icon: 'mdi-warehouse',
    color: 'success',
    userCount: 15,
    permissions: ['Read', 'Update', 'Goods Received', 'Inventory'],
  },
  {
    id: 4,
    name: 'User',
    description: 'Basic read-only access to view data',
    icon: 'mdi-account',
    color: 'info',
    userCount: 45,
    permissions: ['Read', 'View Products', 'View Reports'],
  },
  {
    id: 5,
    name: 'Auditor',
    description: 'Can view all data and generate reports',
    icon: 'mdi-clipboard-check',
    color: 'warning',
    userCount: 5,
    permissions: ['Read', 'View All', 'Generate Reports', 'Export Data'],
  },
])

const editRole = (role: Role) => {
  console.log('Edit role:', role)
}

const deleteRole = (role: Role) => {
  console.log('Delete role:', role)
}
</script>

<style scoped>
.role-card {
  transition: transform 0.2s;
}

.role-card:hover {
  transform: translateY(-4px);
}
</style>
