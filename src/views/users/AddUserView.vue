<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <PageHeader title="Add New User" show-back @back="goBack" />

        <v-card max-width="800" class="mx-auto">
          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="valid" @submit.prevent="handleAddUser">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.fullName"
                    :rules="nameRules"
                    label="Full Name"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.email"
                    :rules="emailRules"
                    label="Email"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.role"
                    :items="roleOptions"
                    :rules="roleRules"
                    label="Role"
                    prepend-inner-icon="mdi-shield-account"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    :loading="isRolesLoading"
                    no-data-text="No roles found. Add a custom role."
                    required
                  ></v-select>
                  <div class="d-flex justify-end mt-2">
                    <v-btn
                      size="small"
                      variant="text"
                      color="primary"
                      prepend-icon="mdi-plus"
                      @click="roleDialog = true"
                    >
                      Add Custom Role
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.status"
                    :items="statusOptions"
                    :rules="statusRules"
                    label="Status"
                    prepend-inner-icon="mdi-check-circle"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    required
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.password"
                    :rules="passwordRules"
                    :type="showPassword ? 'text' : 'password'"
                    label="Initial Password"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="togglePasswordVisibility"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    hint="User can change this after first login"
                    persistent-hint
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.confirmPassword"
                    :rules="confirmPasswordRules"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    label="Confirm Password"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="toggleConfirmPasswordVisibility"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-alert v-if="errorMessage" type="error" class="mt-4">{{ errorMessage }}</v-alert>

              <v-alert v-if="successMessage" type="success" class="mt-4">
                {{ successMessage }}
              </v-alert>

              <div class="d-flex justify-end gap-3 mt-6">
                <v-btn color="grey" variant="outlined" @click="goBack">Cancel</v-btn>
                <v-btn
                  type="submit"
                  :loading="loading"
                  :disabled="!valid"
                  color="primary"
                  variant="flat"
                >
                  Create User
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="roleDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">Add Custom Role</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newRoleName"
            label="Role Name"
            prepend-inner-icon="mdi-shield-account"
            variant="outlined"
            density="comfortable"
            :rules="newRoleNameRules"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeRoleDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="isSavingRole" @click="addCustomRole">
            Save Role
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import router from '@/router'
import { createUserWithEmailAndPassword, getAuth, signOut, updateProfile } from 'firebase/auth'
import { deleteApp, getApps, initializeApp } from 'firebase/app'
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { auth, db, firebaseApp } from '@/plugins/firebase'
import PageHeader from '@/component/common/PageHeader.vue'
import inputValidator from '@/helpers/utils/inputValidator'

interface FormValidation {
  validate: () => Promise<{ valid: boolean }>
}

const formRef = ref<FormValidation | null>(null)
const valid = ref(false)
const form = ref({
  fullName: '',
  email: '',
  role: '',
  status: 'Active',
  password: '',
  confirmPassword: '',
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isRolesLoading = ref(false)
const roleDialog = ref(false)
const newRoleName = ref('')
const isSavingRole = ref(false)

const roleOptions = ref<string[]>([])
const statusOptions = ['Active', 'Inactive']

const nameRules = [
  (v: string) => !!v || 'Full name is required',
  (v: string) => v.length >= 3 || 'Full name must be at least 3 characters',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
]

const roleRules = [(v: string) => !!v || 'Role is required']
const statusRules = [(v: string) => !!v || 'Status is required']
const newRoleNameRules = [(v: string) => !!v?.trim() || 'Role name is required']

const passwordRules = inputValidator('Password').required().minChar(6).getRules()

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm the password',
  (v: string) => v === form.value.password || 'Passwords do not match',
]

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const goBack = () => {
  router.push({ name: 'Users' })
}

const normalizeRoleKey = (value: string) => {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

const loadRoles = async () => {
  isRolesLoading.value = true
  try {
    const rolesCollection = collection(db, 'roles')
    const snapshot = await getDocs(rolesCollection)
    const names = snapshot.docs
      .map((row) => String(row.data().name ?? '').trim())
      .filter((name) => Boolean(name))
      .sort((a, b) => a.localeCompare(b))

    roleOptions.value = names
  } catch (error) {
    console.error('Failed to load roles:', error)
  } finally {
    isRolesLoading.value = false
  }
}

const closeRoleDialog = () => {
  roleDialog.value = false
  newRoleName.value = ''
}

const addCustomRole = async () => {
  const roleName = newRoleName.value.trim()
  if (!roleName) {
    return
  }

  isSavingRole.value = true
  try {
    const rolesCollection = collection(db, 'roles')
    const duplicateQuery = query(rolesCollection, where('name', '==', roleName))
    const duplicateSnapshot = await getDocs(duplicateQuery)

    if (!duplicateSnapshot.empty) {
      errorMessage.value = 'Role already exists.'
      return
    }

    const roleKey = normalizeRoleKey(roleName)
    await setDoc(doc(db, 'roles', roleKey), {
      name: roleName,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'admin',
    })

    await loadRoles()
    form.value.role = roleName
    successMessage.value = `Role "${roleName}" added.`
    closeRoleDialog()
  } catch (error) {
    console.error('Failed to add role:', error)
    errorMessage.value = 'Failed to add role. Please try again.'
  } finally {
    isSavingRole.value = false
  }
}

const extractAuthCode = (error: string): string => {
  if (!error.startsWith('Firebase: Error (')) {
    return error
  }

  const match = error.match(/\(auth\/[\w-]+\)/)
  return match ? match[0].replace(/[()]/g, '') : error
}

const toUserMessage = (error: string): string => {
  const code = extractAuthCode(error)

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.'
    case 'auth/configuration-not-found':
      return 'Firebase Auth is not configured. Enable Email/Password in Firebase Console.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    default:
      return `Error: ${code}`
  }
}

const handleAddUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const validation = await formRef.value?.validate()
  if (!validation?.valid) {
    return
  }

  loading.value = true
  let secondaryAppToCleanup: ReturnType<typeof initializeApp> | null = null

  try {
    const currentAdminUid = auth.currentUser?.uid || null

    //create user using a secondary auth instance so current session is preserved
    const secondaryAppName = 'SecondaryUserCreation'
    const existingSecondaryApp = getApps().find((app) => app.name === secondaryAppName)
    if (existingSecondaryApp) {
      await deleteApp(existingSecondaryApp)
    }

    const secondaryApp = initializeApp(firebaseApp.options, secondaryAppName)
    secondaryAppToCleanup = secondaryApp
    const secondaryAuth = getAuth(secondaryApp)

    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      form.value.email,
      form.value.password,
    )

    //update display name
    await updateProfile(credential.user, {
      displayName: form.value.fullName,
    })

    //create user profile in Firestore
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      name: form.value.fullName,
      email: form.value.email,
      role: form.value.role,
      status: form.value.status,
      createdAt: serverTimestamp(),
      createdBy: currentAdminUid || auth.currentUser?.uid || 'admin',
    })

    await signOut(secondaryAuth)
    await deleteApp(secondaryApp)
    secondaryAppToCleanup = null

    successMessage.value = 'User created successfully!'

    form.value = {
      fullName: '',
      email: '',
      role: '',
      status: 'Active',
      password: '',
      confirmPassword: '',
    }
    valid.value = false
  } catch (error: unknown) {
    const errorText = error instanceof Error ? error.message : 'Unknown error'
    errorMessage.value = toUserMessage(errorText)
    console.error('Add user error:', error)
  } finally {
    if (secondaryAppToCleanup) {
      try {
        await deleteApp(secondaryAppToCleanup)
      } catch {}
    }
    loading.value = false
  }
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
