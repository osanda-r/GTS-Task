<template>
  <v-app-bar elevation="0" border="b" color="white" height="64">
    <!-- Left Section: Menu Icon and Breadcrumb -->
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>

    <div class="d-flex align-center gap-2 ml-2">
      <v-btn variant="text" color="grey-darken-2" class="text-none">
        <v-icon start>mdi-home-outline</v-icon>
        Home
      </v-btn>

      <v-icon size="small" color="grey">mdi-chevron-right</v-icon>

      <span class="text-grey-darken-1">Dashboard</span>
    </div>

    <v-spacer></v-spacer>

    <!-- Right Section: Actions and User Menu -->
    <div class="d-flex align-center gap-1">
      <!-- Notifications -->
      <v-btn icon variant="text">
        <v-badge content="3" color="error" offset-x="8" offset-y="8">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- Mobile Icon -->
      <v-btn icon variant="text">
        <v-icon>mdi-cellphone</v-icon>
      </v-btn>

      <!-- Dark Mode Toggle -->
      <v-btn icon variant="text" @click="toggleTheme">
        <v-icon>mdi-moon-waning-crescent</v-icon>
      </v-btn>

      <!-- User Profile Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none ml-2" style="text-transform: none">
            <v-avatar color="green" size="40" class="mr-2">
              <span class="text-white font-weight-medium">AD</span>
            </v-avatar>
            <span class="mr-1">Admin</span>
            <v-icon size="small">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="goToProfile">
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>

          <v-list-item @click="goToSettings">
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import useAuth from '@/composables/useAuth'

const theme = useTheme()
const { logout: authLogout } = useAuth()

// Emit event to parent for drawer toggle
const emit = defineEmits(['toggle-drawer'])

const toggleDrawer = () => {
  emit('toggle-drawer')
}

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const goToProfile = () => {
  console.log('Navigate to profile')
  // Add your navigation logic here
}

const goToSettings = () => {
  console.log('Navigate to settings')
  // Add your navigation logic here
}

const logout = async () => {
  await authLogout()
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>
