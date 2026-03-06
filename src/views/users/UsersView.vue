<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4 font-weight-bold">Users</h1>
          <v-btn color="primary" prepend-icon="mdi-account-plus"> Add New User </v-btn>
        </div>

        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Search users..."
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="users"
            :search="search"
            item-value="id"
            class="elevation-1"
          >
            <template v-slot:item.avatar="{ item }">
              <v-avatar color="primary" size="32">
                <span class="text-white">{{ item.initials }}</span>
              </v-avatar>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'Active' ? 'success' : 'error'"
                size="small"
                variant="flat"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon="mdi-eye" size="small" variant="text"></v-btn>
              <v-btn icon="mdi-pencil" size="small" variant="text"></v-btn>
              <v-btn icon="mdi-delete" size="small" variant="text" color="error"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

const headers = [
  { title: '', key: 'avatar', sortable: false },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Last Login', key: 'lastLogin', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    initials: 'JD',
    email: 'john@example.com',
    role: 'Administrator',
    status: 'Active',
    lastLogin: '2026-03-06 09:30',
  },
  {
    id: 2,
    name: 'Jane Smith',
    initials: 'JS',
    email: 'jane@example.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2026-03-06 08:15',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    initials: 'MJ',
    email: 'mike@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2026-03-05 16:45',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    initials: 'SW',
    email: 'sarah@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2026-02-28 14:20',
  },
])
</script>
