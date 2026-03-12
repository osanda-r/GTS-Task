<template>
  <v-row class="mb-6">
    <v-col cols="12" md="8">
      <GoodsOverviewChartCard
        :period="period"
        :labels="labels"
        :series="series"
        @update:period="onUpdatePeriod"
      />
    </v-col>

    <v-col cols="12" md="4">
      <TopProductsCard :products="products" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import GoodsOverviewChartCard from '@/component/dashboard/GoodsOverviewChartCard.vue'
import TopProductsCard from '@/component/dashboard/TopProductsCard.vue'

type ChartPeriod = 'WEEK' | 'MONTH' | 'YEAR'

type TopProduct = {
  name: string
  type: string
  units: number
  price: number
  color: string
  icon: string
}

defineProps<{
  period: ChartPeriod
  labels: string[]
  series: number[]
  products: TopProduct[]
}>()

const emit = defineEmits<{
  (event: 'update:period', value: ChartPeriod): void
}>()

const onUpdatePeriod = (value: ChartPeriod) => {
  emit('update:period', value)
}
</script>
