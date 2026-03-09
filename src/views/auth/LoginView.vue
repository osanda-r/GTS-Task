<template>
  <v-container fluid class="fill-height login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <v-card class="login-card elevation-12" rounded="lg">
          <div class="text-center pt-8 pb-4">
            <v-avatar color="primary" size="80" class="mb-4">
              <v-icon size="40" color="white">mdi-account-circle</v-icon>
            </v-avatar>
            <h2 class="text-h4 font-weight-bold mb-2">Welcome Back</h2>
            <p class="text-grey">Sign in to continue</p>
          </div>

          <v-card-text class="px-8 pb-0">
            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
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
                density="comfortable"
                required
              ></v-text-field>

              <div class="d-flex justify-space-between align-center mb-4">
                <v-checkbox
                  v-model="rememberMe"
                  label="Remember me"
                  color="primary"
                  density="compact"
                  hide-details
                ></v-checkbox>
                <a href="#" class="text-primary text-decoration-none"> Forgot password? </a>
              </div>

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
                Sign In
              </v-btn>

              <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import inputValidator from '@/helpers/utils/inputValidator'
import useAuth from '@/composables/useAuth'

// Reactive state
const form = ref(null)
const valid = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Authentication logic
const { login } = useAuth()

// Email validation rules
const emailRules = [
  (v) => !!v || 'Email is required',
  (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
]

// Password validation rules
const passwordRules = inputValidator('Password').required().minChar(6).getRules()

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Handle form submission (login logic)
const handleLogin = async () => {
  errorMessage.value = ''
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  loading.value = true
  const result = await login(email.value, password.value)
  loading.value = false

  // If login is successful, redirect
  if (result.success) {
    window.location.href = '/'
    return
  }

  // Handle Firebase error codes
  handleFirebaseError(result.error)
}

// Firebase error handler (simplified)
const handleFirebaseError = (error: string) => {
  if (error.startsWith('Firebase: Error (')) {
    const match = error.match(/\(auth\/[\w-]+\)/)
    if (match) error = match[0].replace(/[()]/g, '')
  }

  // Map error codes to user-friendly messages
  switch (error) {
    case 'auth/invalid-email':
      errorMessage.value = 'Invalid email format. Please try again.'
      break
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      errorMessage.value = 'Incorrect email or password'
      break
    case 'auth/too-many-requests':
      errorMessage.value = 'Too many attempts. Please try again later.'
      break
    case 'auth/network-request-failed':
      errorMessage.value = 'Cannot connect to the server. Check your network.'
      break
    default:
      errorMessage.value = `Error: ${error ?? 'Unknown error'}`
      console.error('Firebase error:', error)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
}

.login-card {
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
