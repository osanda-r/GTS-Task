<template>
  <v-navigation-drawer v-model="localDrawer" app width="280" color="white" class="sidebar">
    <!-- Logo Section -->
    <div class="logo-section pa-6 text-center">
      <div class="logo-text mb-2">
        <span class="text-h5 font-weight-bold">GTS</span>
        <span class="text-caption" style="vertical-align: super; font-size: 10px">ACTIVE</span>
      </div>

      <p class="text-caption text-grey">Product Management System</p>
    </div>

    <v-divider></v-divider>

    <!-- Navigation Items -->
    <v-list nav density="compact" class="py-2">
      <!-- DASHBOARD Section -->
      <v-list-subheader class="text-caption text-grey font-weight-bold px-4 py-3">
        DASHBOARD
      </v-list-subheader>

      <v-list-item
        to="/dashboard"
        :active="isActive('/dashboard')"
        class="mx-2 rounded"
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
      >
      </v-list-item>

      <!-- PROCUREMENT Section -->
      <v-list-subheader class="text-caption text-grey font-weight-bold px-4 py-3 mt-4">
        PROCUREMENT
      </v-list-subheader>

      <v-list-item
        to="/goods-received"
        :active="isActive('/goods-received')"
        class="mx-2 rounded"
        prepend-icon="mdi-truck-delivery"
        title="Goods Received"
      >
      </v-list-item>

      <!-- USER MANAGEMENT Section -->
      <v-list-subheader class="text-caption text-grey font-weight-bold px-4 py-3 mt-4">
        USER MANAGEMENT
      </v-list-subheader>

      <v-list-item
        to="/users"
        :active="isActive('/users')"
        class="mx-2 rounded"
        prepend-icon="mdi-account-multiple"
        title="Users"
      >
      </v-list-item>

      <v-list-item
        to="/roles"
        :active="isActive('/roles')"
        class="mx-2 rounded"
        prepend-icon="mdi-shield-account"
        title="Roles"
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'AppSidebar',
})

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const route = useRoute()

const localDrawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #e0e0e0;
}

.logo-section {
  background-color: white;
}

.logo-text {
  font-family: 'Times New Roman', serif;
  letter-spacing: 2px;
}

.v-list-item--active {
  background-color: #f5f5f5 !important;
}

.v-list-item:hover {
  background-color: #fafafa;
}

.v-list-subheader {
  height: auto !important;
  min-height: 32px;
}
</style>
