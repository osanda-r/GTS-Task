<template>
  <v-container fluid class="dashboard-container">
    <PageHeader
      title="Dashboard"
      :subtitle="`Welcome back, ${userName}! Here's what's happening today.`"
      container-class="mb-6"
    >
      <template #actions>
        <v-btn color="success" prepend-icon="mdi-plus" size="large">ADD PRODUCT</v-btn>
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
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card elevation="0" rounded="lg" class="chart-card">
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Goods Received Overview</h3>
              <PeriodSelector v-model="chartPeriod" />
            </div>
            <canvas ref="goodsChart" height="80"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="0" rounded="lg" class="products-card">
          <v-card-text class="pa-6">
            <h3 class="text-h6 font-weight-bold mb-4">Top Products</h3>
            <div class="products-list">
              <div v-for="(product, index) in topProducts" :key="index" class="product-item mb-4">
                <div class="d-flex gap-3 align-start">
                  <v-avatar :color="product.color" size="48" icon="mdi-leaf"></v-avatar>
                  <div class="flex-grow-1">
                    <h4 class="text-body1 font-weight-bold">{{ product.name }}</h4>
                    <p class="text-body2 text-grey mb-1">
                      {{ product.units.toLocaleString() }} units sold
                    </p>
                    <p class="text-body2 text-success font-weight-bold">{{ product.price }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Goods Received Stats -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <h3 class="text-h6 font-weight-bold mb-4">Goods Received Statistics</h3>
            <StatRow label="Total Shipments" :value="goodsStats.totalShipments" with-border />
            <StatRow
              label="Total Weight (Kg)"
              :value="goodsStats.totalWeight.toLocaleString()"
              with-border
            />
            <StatRow label="Average Supplier" :value="goodsStats.avgSuppliers" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <h3 class="text-h6 font-weight-bold mb-4">User Activity</h3>
            <StatRow label="Total Users" :value="userStats.totalUsers" with-border />
            <StatRow
              label="Active Users"
              :value="userStats.activeUsers"
              value-class="text-success"
              with-border
            />
            <StatRow
              label="Inactive Users"
              :value="userStats.inactiveUsers"
              value-class="text-error"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { getDoc, doc, getDocs, collection } from 'firebase/firestore'
import { db, auth } from '@/plugins/firebase'
import PageHeader from '@/component/common/PageHeader.vue'
import MetricCard from '@/component/common/MetricCard.vue'
import PeriodSelector from '@/component/common/PeriodSelector.vue'
import StatRow from '@/component/common/StatRow.vue'

const userName = ref('John')
const goodsChart = ref<HTMLCanvasElement | null>(null)
const chartPeriod = ref<'WEEK' | 'MONTH' | 'YEAR'>('MONTH')
const chartLabels = ref<string[]>([])
const chartSeries = ref<number[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chartInstance: any = null

// Top Products
const topProducts = ref([
  {
    name: 'Organic Green Tea',
    units: 234,
    price: '$4',
    color: 'success',
  },
  {
    name: 'Fresh Vegetables Pack',
    units: 189,
    price: '$3',
    color: 'info',
  },
  {
    name: 'Organic Honey',
    units: 156,
    price: '$3',
    color: 'warning',
  },
  {
    name: 'Brown Rice',
    units: 142,
    price: '$2',
    color: 'error',
  },
])

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

const loadUserName = async () => {
  try {
    if (auth.currentUser?.uid) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (userDoc.exists()) {
        const name = userDoc.data().name
        userName.value = name?.split(' ')[0] || 'User'
      }
    }
  } catch (error) {
    console.error('Failed to load user name:', error)
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

const initGoodsChart = () => {
  if (!goodsChart.value) {
    return
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = goodsChart.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: 'Shipments Received',
          data: chartSeries.value,
          fill: true,
          borderColor: '#00bcd4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#00bcd4',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

watch(chartPeriod, () => {
  loadGoodsChartData().then(() => initGoodsChart())
})

onMounted(async () => {
  await loadUserName()
  await loadGoodsStats()
  await loadUserStats()
  await loadGoodsChartData()
  initGoodsChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
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

.products-card {
  background: #fff !important;
  border: 1px solid #e0e0e0;
}

.product-item {
  padding-bottom: 16px;
}

.product-item:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.stat-item {
  border-color: #e0e0e0 !important;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.text-grey {
  color: #999;
}

.products-list {
  max-height: 450px;
  overflow-y: auto;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>
