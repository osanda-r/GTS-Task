<template>
  <v-card elevation="0" rounded="lg" class="chart-card">
    <v-card-text class="pa-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h6 font-weight-bold">Goods Received Overview</h3>
        <PeriodSelector :model-value="period" @update:model-value="updatePeriod" />
      </div>
      <canvas ref="chartCanvas" height="80"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import PeriodSelector from '@/component/common/PeriodSelector.vue'

type ChartPeriod = 'WEEK' | 'MONTH' | 'YEAR'

const props = defineProps<{
  period: ChartPeriod
  labels: string[]
  series: number[]
}>()

const emit = defineEmits<{
  (event: 'update:period', value: ChartPeriod): void
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chartInstance: any = null

const renderChart = () => {
  if (!chartCanvas.value) {
    return
  }

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) {
    return
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: 'Shipments Received',
          data: props.series,
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

const updatePeriod = (value: ChartPeriod) => {
  emit('update:period', value)
}

watch(
  () => [props.labels, props.series],
  () => {
    renderChart()
  },
  { deep: true },
)

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>
