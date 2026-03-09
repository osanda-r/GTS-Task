<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4 font-weight-bold">Users</h1>
          <v-btn color="primary" prepend-icon="mdi-account-plus" @click="addNewUser">
            Add New User
          </v-btn>
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
            :loading="loading"
            item-value="id"
            class="elevation-1"
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

            <template v-slot:[`item.actions`]>
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
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

const router = useRouter()

const search = ref('')
const loading = ref(false)

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

const headers = [
  { title: '', key: 'avatar', sortable: false },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Last Login', key: 'lastLogin', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const users = ref<UserRecord[]>([])

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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
