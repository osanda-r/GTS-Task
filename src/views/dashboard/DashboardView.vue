<template>
  <v-container fluid class="dashboard-container">
    <PageHeader
      title="Dashboard"
      :subtitle="`Welcome back, ${userName}! Here's what's happening today.`"
      container-class="mb-6"
    >
      <template #actions v-if="canAddProduct">
        <v-btn color="success" prepend-icon="mdi-plus" size="large" @click="goToAddProduct">
          ADD PRODUCT
        </v-btn>
      </template>
    </PageHeader>

    <!-- Metrics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <MetricCard
          title="Total Shipments"
          :value="goodsStats.totalShipments"
          icon="mdi-truck-delivery-outline"
          icon-color="success"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <MetricCard
          title="Total Weight (Kg)"
          :value="goodsStats.totalWeight.toLocaleString()"
          icon="mdi-weight-kilogram"
          icon-color="info"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <MetricCard
          title="Average Supplier"
          :value="goodsStats.avgSuppliers"
          icon="mdi-store-outline"
          icon-color="warning"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <MetricCard
          title="Total Users"
          :value="userStats.totalUsers"
          icon="mdi-account-multiple"
          icon-color="primary"
        />
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <DashboardChartsSection
      :period="chartPeriod"
      :labels="chartLabels"
      :series="chartSeries"
      :products="topProducts"
      @update:period="chartPeriod = $event"
    />

    <!-- Goods Received Stats -->
    <v-row>
      <v-col cols="12" md="6">
        <GoodsReceivedStatsCard :stats="goodsStats" />
      </v-col>

      <v-col cols="12" md="6">
        <UserActivityCard :stats="userStats" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import {
  where,
  getDoc,
  doc,
  getDocs,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { db, auth } from '@/plugins/firebase'
import PageHeader from '@/component/common/PageHeader.vue'
import MetricCard from '@/component/common/MetricCard.vue'
import DashboardChartsSection from '@/component/dashboard/DashboardChartsSection.vue'
import GoodsReceivedStatsCard from '@/component/dashboard/GoodsReceivedStatsCard.vue'
import UserActivityCard from '@/component/dashboard/UserActivityCard.vue'
import { getProductIconByType, normalizeProductType } from '@/helpers/utils/productIconUtils'

type TopProduct = {
  name: string
  type: string
  units: number
  price: number
  color: string
  icon: string
}

const router = useRouter()
const userName = ref('John')
const chartPeriod = ref<'WEEK' | 'MONTH' | 'YEAR'>('MONTH')
const chartLabels = ref<string[]>([])
const chartSeries = ref<number[]>([])
let unsubscribeTopProducts: (() => void) | null = null
const userPermissions = ref<string[]>([])
const userRole = ref('')

// Top Products
const topProducts = ref<TopProduct[]>([])

// Statistics
const goodsStats = ref({
  totalShipments: 0,
  totalWeight: 0,
  avgSuppliers: 0,
})

const userStats = ref({
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
})

const isAdministrator = computed(() => userRole.value.toLowerCase() === 'administrator')
const canAddProduct = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.products.create'),
)

const goToAddProduct = () => {
  router.push({ name: 'AddProduct' })
}

const loadUserName = async () => {
  try {
    if (auth.currentUser?.uid) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        const name = data.name
        userRole.value = String(data.role ?? '').trim()
        userName.value = name?.split(' ')[0] || 'User'
      }
    }
  } catch (error) {
    console.error('Failed to load user name:', error)
  }
}

const loadUserPermissions = async () => {
  try {
    if (!auth.currentUser?.uid) {
      userPermissions.value = []
      return
    }

    if (isAdministrator.value) {
      userPermissions.value = [
        'page.dashboard.view',
        'page.products.create',
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
      query(collection(db, 'roles'), where('name', '==', userRole.value)),
    )
    const roleDoc = roleSnapshot.docs[0]
    userPermissions.value = Array.isArray(roleDoc?.data().permissions)
      ? roleDoc.data().permissions.map((permission: unknown) => String(permission))
      : []
  } catch (error) {
    console.error('Failed to load dashboard permissions:', error)
    userPermissions.value = []
  }
}

const loadGoodsStats = async () => {
  try {
    const goodsCollection = collection(db, 'goodsReceived')
    const snapshot = await getDocs(goodsCollection)

    let totalWeight = 0
    const suppliers = new Set<string>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      totalWeight += Number(data.grossWeight || 0)
      if (data.supplier) {
        suppliers.add(String(data.supplier))
      }
    })

    goodsStats.value = {
      totalShipments: snapshot.docs.length,
      totalWeight: Math.round(totalWeight),
      avgSuppliers: suppliers.size,
    }
  } catch (error) {
    console.error('Failed to load goods stats:', error)
  }
}

const loadUserStats = async () => {
  try {
    const usersCollection = collection(db, 'users')
    const snapshot = await getDocs(usersCollection)

    let active = 0
    let inactive = 0

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.status === 'Active') {
        active++
      } else if (data.status === 'Inactive') {
        inactive++
      }
    })

    userStats.value = {
      totalUsers: snapshot.docs.length,
      activeUsers: active,
      inactiveUsers: inactive,
    }
  } catch (error) {
    console.error('Failed to load user stats:', error)
  }
}

const subscribeTopProducts = () => {
  try {
    const productsCollection = collection(db, 'products')
    const productsQuery = query(productsCollection, orderBy('createdAt', 'desc'), limit(4))

    unsubscribeTopProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        topProducts.value = snapshot.docs.map((row) => {
          const data = row.data()
          return {
            name: String(data.name ?? 'Unnamed Product'),
            type: normalizeProductType(String(data.type ?? 'other')),
            units: Number(data.units ?? 0),
            price: Number(data.price ?? 0),
            color: String(data.color ?? 'success'),
            icon: String(data.icon ?? getProductIconByType(String(data.type ?? 'other'))),
          }
        })
      },
      (error) => {
        console.error('Failed to subscribe top products:', error)
        topProducts.value = []
      },
    )
  } catch (error) {
    console.error('Failed to initialize top products subscription:', error)
    topProducts.value = []
  }
}

const toSafeDate = (value: unknown): Date | null => {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeTimestamp = value as { toDate?: () => Date }
    if (typeof maybeTimestamp.toDate === 'function') {
      const date = maybeTimestamp.toDate()
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  return null
}

const buildWeeklySeries = (dates: Date[]) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = [0, 0, 0, 0, 0, 0, 0]

  const now = new Date()
  const weekStart = new Date(now)
  const dayOffset = (now.getDay() + 6) % 7
  weekStart.setDate(now.getDate() - dayOffset)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  dates.forEach((date) => {
    if (date >= weekStart && date < weekEnd) {
      const idx = (date.getDay() + 6) % 7
      data[idx] += 1
    }
  })

  return { labels, data }
}

const buildMonthlySeries = (dates: Date[]) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1))
  const data = Array.from({ length: daysInMonth }, () => 0)

  dates.forEach((date) => {
    if (date.getFullYear() === year && date.getMonth() === month) {
      data[date.getDate() - 1] += 1
    }
  })

  return { labels, data }
}

const buildYearlySeries = (dates: Date[]) => {
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const year = new Date().getFullYear()

  dates.forEach((date) => {
    if (date.getFullYear() === year) {
      data[date.getMonth()] += 1
    }
  })

  return { labels, data }
}

const loadGoodsChartData = async () => {
  try {
    const goodsCollection = collection(db, 'goodsReceived')
    const snapshot = await getDocs(goodsCollection)
    const createdDates = snapshot.docs
      .map((row) => toSafeDate(row.data().createdAt))
      .filter((date): date is Date => date !== null)

    const series =
      chartPeriod.value === 'WEEK'
        ? buildWeeklySeries(createdDates)
        : chartPeriod.value === 'MONTH'
          ? buildMonthlySeries(createdDates)
          : buildYearlySeries(createdDates)

    chartLabels.value = series.labels
    chartSeries.value = series.data
  } catch (error) {
    console.error('Failed to load chart data:', error)
    chartLabels.value = []
    chartSeries.value = []
  }
}

watch(chartPeriod, () => {
  loadGoodsChartData()
})

onMounted(async () => {
  await loadUserName()
  await loadUserPermissions()
  await loadGoodsStats()
  await loadUserStats()
  subscribeTopProducts()
  await loadGoodsChartData()
})

onBeforeUnmount(() => {
  if (unsubscribeTopProducts) {
    unsubscribeTopProducts()
    unsubscribeTopProducts = null
  }
})
</script>

<style scoped>
.dashboard-container {
  background: #f5f5f5;
  padding: 30px 20px;
  min-height: 100vh;
}

.metric-card {
  background: #fff !important;
  border: 1px solid #e0e0e0;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.chart-card {
  background: #fff !important;
  border: 1px solid #e0e0e0;
}

.stat-item {
  border-color: #e0e0e0 !important;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.gap-2 {
  gap: 8px;
}
</style>
