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
      <v-list-subheader
        v-if="canViewDashboard"
        class="text-caption text-grey font-weight-bold px-4 py-3"
      >
        DASHBOARD
      </v-list-subheader>

      <v-list-item
        v-if="canViewDashboard"
        to="/dashboard"
        :active="isActive('/dashboard')"
        class="mx-2 rounded"
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
      >
      </v-list-item>

      <!-- PROCUREMENT Section -->
      <v-list-subheader
        v-if="canViewGoodsReceived"
        class="text-caption text-grey font-weight-bold px-4 py-3 mt-4"
      >
        PROCUREMENT
      </v-list-subheader>

      <v-list-item
        v-if="canViewGoodsReceived"
        to="/goods-received"
        :active="isActive('/goods-received')"
        class="mx-2 rounded"
        prepend-icon="mdi-truck-delivery"
        title="Goods Received"
      >
      </v-list-item>

      <!-- USER MANAGEMENT Section -->
      <v-list-subheader
        v-if="canViewUsers || canViewRoles"
        class="text-caption text-grey font-weight-bold px-4 py-3 mt-4"
      >
        USER MANAGEMENT
      </v-list-subheader>

      <v-list-item
        v-if="canViewUsers"
        to="/users"
        :active="isActive('/users')"
        class="mx-2 rounded"
        prepend-icon="mdi-account-multiple"
        title="Users"
      >
      </v-list-item>

      <v-list-item
        v-if="canViewRoles"
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { auth, db } from '@/plugins/firebase'
import router from '@/router'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'

defineOptions({
  name: 'AppSidebar',
})

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userPermissions = ref<string[]>([])
const userRole = ref<string>('')

const localDrawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isAdministrator = computed(() => userRole.value.toLowerCase() === 'administrator')

const canViewDashboard = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.dashboard.view'),
)

const canViewGoodsReceived = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.goods_received.view'),
)
const canViewUsers = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.users.view'),
)
const canViewRoles = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.roles.view'),
)
const loadUserPermissions = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) {
      userPermissions.value = []
      userRole.value = ''
      return
    }

    const roleName = String(userDoc.data().role ?? '').trim()
    userRole.value = roleName

    if (!roleName) {
      userPermissions.value = []
      return
    }

    //administrator has all permissions
    if (roleName.toLowerCase() === 'administrator') {
      userPermissions.value = [
        'page.dashboard.view',
        'page.goods_received.view',
        'page.goods_received.create',
        'page.goods_received.edit',
        'page.goods_received.delete',
        'page.users.view',
        'page.users.create',
        'page.users.edit',
        'page.users.delete',
        'page.roles.view',
        'page.roles.create',
        'page.roles.edit',
        'page.roles.delete',
      ]
      return
    }

    const roleSnapshot = await getDocs(
      query(collection(db, 'roles'), where('name', '==', roleName)),
    )
    const roleDoc = roleSnapshot.docs[0]
    const permissions = Array.isArray(roleDoc?.data().permissions)
      ? roleDoc.data().permissions.map((permission: unknown) => String(permission))
      : []

    userPermissions.value = permissions
  } catch (error) {
    console.error('Failed to load sidebar permissions:', error)
    userPermissions.value = []
    userRole.value = ''
  }
}

let unsubscribeAuth: (() => void) | undefined

onMounted(() => {
  unsubscribeAuth = auth.onAuthStateChanged((user) => {
    if (!user) {
      userPermissions.value = []
      return
    }
    loadUserPermissions(user.uid)
  })
})

onUnmounted(() => {
  unsubscribeAuth?.()
})

const isActive = (path: string) => {
  const currentPath = router.currentRoute.value.path
  return currentPath === path || currentPath.startsWith(path + '/')
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
  background-color: #44ff0033 !important;
}

.v-list-item:hover {
  background-color: #2f85332a;
}

.v-list-subheader {
  height: auto !important;
  min-height: 32px;
}
</style>
