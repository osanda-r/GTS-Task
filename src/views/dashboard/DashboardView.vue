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
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="text-body2 text-grey mb-2">Total Revenue</p>
                <h2 class="text-h4 font-weight-bold">{{ formatCurrency(totalRevenue) }}</h2>
                <p
                  class="text-body2 mt-2"
                  :class="revenueChange >= 0 ? 'text-success' : 'text-error'"
                >
                  <v-icon size="16">{{
                    revenueChange >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
                  }}</v-icon>
                  {{ Math.abs(revenueChange) }}% from last month
                </p>
              </div>
              <v-avatar color="success" icon="mdi-cash-multiple" size="56"></v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="text-body2 text-grey mb-2">Total Orders</p>
                <h2 class="text-h4 font-weight-bold">{{ totalOrders.toLocaleString() }}</h2>
                <p
                  class="text-body2 mt-2"
                  :class="ordersChange >= 0 ? 'text-success' : 'text-error'"
                >
                  <v-icon size="16">{{
                    ordersChange >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
                  }}</v-icon>
                  {{ Math.abs(ordersChange) }}% from last month
                </p>
              </div>
              <v-avatar color="success" icon="mdi-shopping-cart" size="56"></v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="text-body2 text-grey mb-2">Total Products</p>
                <h2 class="text-h4 font-weight-bold">{{ totalProducts }}</h2>
                <p
                  class="text-body2 mt-2"
                  :class="productsChange >= 0 ? 'text-success' : 'text-error'"
                >
                  <v-icon size="16">{{
                    productsChange >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
                  }}</v-icon>
                  {{ Math.abs(productsChange) }}% from last month
                </p>
              </div>
              <v-avatar color="info" icon="mdi-package-variant" size="56"></v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0" rounded="lg">
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="text-body2 text-grey mb-2">Total Customers</p>
                <h2 class="text-h4 font-weight-bold">{{ totalCustomers }}</h2>
                <p
                  class="text-body2 mt-2"
                  :class="customersChange >= 0 ? 'text-success' : 'text-error'"
                >
                  <v-icon size="16">{{
                    customersChange >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
                  }}</v-icon>
                  {{ Math.abs(customersChange) }}% from last month
                </p>
              </div>
              <v-avatar color="warning" icon="mdi-account-multiple" size="56"></v-avatar>
            </div>
          </v-card-text>
        </v-card>
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
import { ref, onMounted, watch } from 'vue'
import { getDoc, doc, getDocs, collection } from 'firebase/firestore'
import { db, auth } from '@/plugins/firebase'
import PageHeader from '@/component/common/PageHeader.vue'
import PeriodSelector from '@/component/common/PeriodSelector.vue'
import StatRow from '@/component/common/StatRow.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartLib = (window as any).Chart

const userName = ref('John')
const goodsChart = ref<HTMLCanvasElement | null>(null)
const chartPeriod = ref<'WEEK' | 'MONTH' | 'YEAR'>('MONTH')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chartInstance: any = null

// Metrics
const totalRevenue = ref(45231)
const totalOrders = ref(1524)
const totalProducts = ref(328)
const totalCustomers = ref(892)

const revenueChange = ref(12.5)
const ordersChange = ref(8.2)
const productsChange = ref(-2.4)
const customersChange = ref(15.3)

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

const formatCurrency = (value: number) => {
  return '$' + value.toLocaleString()
}

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

const initGoodsChart = () => {
  if (!goodsChart.value || !ChartLib) {
    return
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = goodsChart.value.getContext('2d')
  if (!ctx) return

  const generateData = () => {
    if (chartPeriod.value === 'WEEK') {
      return [120, 150, 135, 165, 180, 195, 210]
    } else if (chartPeriod.value === 'MONTH') {
      return [300, 350, 320, 380, 420, 450, 480, 520, 550, 600, 650, 700]
    } else {
      return [4000, 4500, 5000, 5200, 5800, 6200, 6800, 7200, 7800, 8200, 8800, 9200]
    }
  }

  const generateLabels = () => {
    if (chartPeriod.value === 'WEEK') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    } else if (chartPeriod.value === 'MONTH') {
      return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    } else {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  }

  chartInstance = new ChartLib(ctx, {
    type: 'line',
    data: {
      labels: generateLabels(),
      datasets: [
        {
          label: 'Shipments Received',
          data: generateData(),
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
  initGoodsChart()
})

onMounted(async () => {
  await loadUserName()
  await loadGoodsStats()
  await loadUserStats()

  // Wait for Chart.js to be available
  const checkChart = setInterval(() => {
    const win = window as unknown as { Chart?: unknown }
    if (typeof win.Chart !== 'undefined') {
      clearInterval(checkChart)
      initGoodsChart()
    }
  }, 100)

  setTimeout(() => clearInterval(checkChart), 5000)
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
