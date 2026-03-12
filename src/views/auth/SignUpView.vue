<template>
  <v-container fluid class="fill-height signup-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="9" md="6" lg="5" xl="4">
        <v-card class="signup-card elevation-12" rounded="lg">
          <div class="text-center pt-8 pb-4">
            <v-avatar color="primary" size="80" class="mb-4">
              <v-icon size="40" color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <h2 class="text-h4 font-weight-bold mb-2">Create Account</h2>
            <p class="text-grey">Register and select your role</p>
          </div>

          <v-card-text class="px-8 pb-6">
            <v-form ref="formRef" v-model="valid" @submit.prevent="handleSignUp">
              <v-text-field
                v-model="fullName"
                :rules="nameRules"
                label="Full Name"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                color="primary"
                class="mb-3"
                density="comfortable"
                required
              ></v-text-field>

              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                color="primary"
                class="mb-3"
                density="comfortable"
                required
              ></v-text-field>

              <v-select
                v-model="role"
                :items="roleOptions"
                :rules="roleRules"
                label="Role"
                prepend-inner-icon="mdi-shield-account"
                variant="outlined"
                color="primary"
                class="mb-3"
                density="comfortable"
                required
              ></v-select>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="togglePasswordVisibility"
                variant="outlined"
                color="primary"
                class="mb-3"
                density="comfortable"
                required
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirm Password"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="toggleConfirmPasswordVisibility"
                variant="outlined"
                color="primary"
                class="mb-4"
                density="comfortable"
                required
              ></v-text-field>

              <v-btn
                type="submit"
                :loading="loading"
                :disabled="!valid"
                block
                size="large"
                color="primary"
                class="mb-4 text-none"
                rounded="lg"
              >
                Sign Up
              </v-btn>

              <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>

              <v-alert v-if="successMessage" type="success" class="mb-4">
                {{ successMessage }}
              </v-alert>

              <v-divider class="mb-4"></v-divider>

              <div class="text-center">
                <span class="text-grey">Already have an account? </span>
                <RouterLink
                  :to="{ name: 'Login' }"
                  class="text-primary text-decoration-none font-weight-bold"
                >
                  Sign In
                </RouterLink>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/plugins/firebase'
import inputValidator from '@/helpers/utils/inputValidator'

interface FormValidation {
  validate: () => Promise<{ valid: boolean }>
}

const router = useRouter()

const formRef = ref<FormValidation | null>(null)
const valid = ref(false)
const fullName = ref('')
const email = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const roleOptions = ['Administrator', 'Manager', 'Warehouse Staff', 'User', 'Auditor']

const nameRules = [
  (v: string) => !!v || 'Full name is required',
  (v: string) => v.length >= 3 || 'Full name must be at least 3 characters',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
]

const roleRules = [(v: string) => !!v || 'Role is required']

const passwordRules = inputValidator('Password').required().minChar(6).getRules()

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === password.value || 'Passwords do not match',
]

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
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
      return 'Firebase Auth sign-in provider is not configured. Enable Email/Password in Firebase Console.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    default:
      return `Error: ${code}`
  }
}

const handleSignUp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const validation = await formRef.value?.validate()
  if (!validation?.valid) {
    return
  }

  loading.value = true

  try {
    const credential = await createUserWithEmailAndPassword(auth, email.value, password.value)

    await updateProfile(credential.user, {
      displayName: fullName.value,
    })

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      name: fullName.value,
      email: email.value,
      role: role.value,
      status: 'Active',
      createdAt: serverTimestamp(),
    })

    successMessage.value = 'Account created successfully. Redirecting...'
    setTimeout(() => {
      router.push({ name: 'Dashboard' })
    }, 800)
  } catch (error: unknown) {
    const errorText = error instanceof Error ? error.message : 'Unknown error'
    errorMessage.value = toUserMessage(errorText)
    console.error('Sign up error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
}

.signup-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.text-grey {
  color: #757575;
}

:deep(.v-field--variant-outlined) {
  border-radius: 12px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 1px;
  font-weight: 600;
}
</style>
