<template>
  <v-container fluid class="profile-page">
    <PageHeader
      title="Profile"
      subtitle="View and manage your account information."
      show-back
      container-class="mb-4"
      @back="goBack"
    />

    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-6">
              <v-avatar color="primary" size="80" class="mr-4">
                <span class="text-h4 font-weight-bold text-white">{{ userInitials }}</span>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ currentUser?.displayName || 'User' }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ currentUser?.email }}</div>
                <div class="text-caption text-disabled mt-2">
                  Account created: {{ userCreatedAt || 'N/A' }}
                </div>
              </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">Account Information</h3>

              <div class="mb-4">
                <label class="text-body-2 text-medium-emphasis">Display Name</label>
                <v-text-field
                  v-model="editForm.displayName"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Enter display name"
                  :disabled="!isEditing"
                  class="mt-2"
                ></v-text-field>
              </div>

              <div class="mb-4">
                <label class="text-body-2 text-medium-emphasis">Email</label>
                <v-text-field
                  v-model="editForm.email"
                  variant="outlined"
                  density="comfortable"
                  disabled
                  class="mt-2"
                ></v-text-field>
              </div>

              <div class="mb-4">
                <label class="text-body-2 text-medium-emphasis">Role</label>
                <v-text-field
                  v-model="userRole"
                  variant="outlined"
                  density="comfortable"
                  disabled
                  class="mt-2"
                ></v-text-field>
              </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <div class="d-flex justify-end gap-3">
              <v-btn
                v-if="!isEditing"
                color="primary"
                variant="flat"
                prepend-icon="mdi-pencil"
                @click="startEditing"
              >
                Edit Profile
              </v-btn>

              <template v-else>
                <v-btn color="grey" variant="outlined" @click="cancelEditing"> Cancel </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  :loading="isSaving"
                  prepend-icon="mdi-check"
                  @click="saveProfile"
                >
                  Save Changes
                </v-btn>
              </template>
            </div>

            <v-alert v-if="successMessage" type="success" class="mt-4">
              {{ successMessage }}
            </v-alert>
            <v-alert v-if="errorMessage" type="error" class="mt-4">
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-title class="text-h6">Security</v-card-title>
          <v-card-text>
            <v-btn color="warning" variant="outlined" block :disabled="isSaving" @click="logout">
              <v-icon start>mdi-logout</v-icon>
              Logout
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card elevation="2" rounded="lg">
          <v-card-title class="text-h6">Account Status</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2">Account Status</span>
              <v-chip color="success" variant="flat" size="small"> Active </v-chip>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="text-caption text-medium-emphasis">
              Last login: {{ lastLoginTime || 'N/A' }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/plugins/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import PageHeader from '@/component/common/PageHeader.vue'
import useAuth from '@/composables/useAuth'

const router = useRouter()
const { logout: authLogout } = useAuth()

const currentUser = computed(() => auth.currentUser)

const userInitials = computed(() => {
  const user = auth.currentUser
  if (!user) return 'U'

  const name = user.displayName || user.email?.split('@')[0] || 'User'
  const parts = name.trim().split(' ')

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const isEditing = ref(false)
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const userRole = ref('')
const userCreatedAt = ref('')
const lastLoginTime = ref('')

const editForm = ref({
  displayName: '',
  email: '',
})

const goBack = () => {
  router.push({ name: 'Dashboard' })
}

const startEditing = () => {
  isEditing.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

const cancelEditing = () => {
  isEditing.value = false
  if (currentUser.value) {
    editForm.value.displayName = currentUser.value.displayName || ''
    editForm.value.email = currentUser.value.email || ''
  }
  errorMessage.value = ''
  successMessage.value = ''
}

const logout = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authLogout()
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    errorMessage.value = `Failed to logout: ${err}`
    console.error('Failed to logout:', error)
  }
}

const saveProfile = async () => {
  if (!currentUser.value) return

  if (!editForm.value.displayName.trim()) {
    errorMessage.value = 'Display name cannot be empty.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Update display name in Firebase Auth
    await updateProfile(currentUser.value, {
      displayName: editForm.value.displayName.trim(),
    })

    // Update user profile in Firestore
    const userDocRef = doc(db, 'users', currentUser.value.uid)
    await updateDoc(userDocRef, {
      name: editForm.value.displayName.trim(),
    })

    successMessage.value = 'Profile updated successfully!'
    isEditing.value = false

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    errorMessage.value = `Failed to update profile: ${err}`
    console.error('Failed to update profile:', error)
  } finally {
    isSaving.value = false
  }
}

const loadUserData = async () => {
  try {
    if (!currentUser.value) return

    // Load user profile from Firestore
    const userDocRef = doc(db, 'users', currentUser.value.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const data = userDocSnap.data()
      userRole.value = data.role || 'User'

      // Format created date
      if (data.createdAt) {
        const date = new Date(data.createdAt.toDate?.() || data.createdAt)
        userCreatedAt.value = date.toLocaleDateString()
      }
    }

    // Set edit form values
    editForm.value.displayName = currentUser.value.displayName || ''
    editForm.value.email = currentUser.value.email || ''

    // Set last login
    if (currentUser.value.metadata?.lastSignInTime) {
      const lastLogin = new Date(currentUser.value.metadata.lastSignInTime)
      lastLoginTime.value = lastLogin.toLocaleString()
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-page {
  background: #f5f5f5;
  padding: 22px;
  min-height: calc(100vh - 64px);
}

.gap-3 {
  gap: 12px;
}
</style>
