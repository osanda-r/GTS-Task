<template>
  <v-card elevation="0" rounded="lg">
    <v-card-text class="pa-6">
      <h3 class="text-h6 font-weight-bold mb-4">Goods Received Statistics</h3>
      <StatRow label="Total Shipments" :value="stats.totalShipments" with-border />
      <StatRow label="Total Weight (Kg)" :value="stats.totalWeight.toLocaleString()" with-border />
      <StatRow label="Average Supplier" :value="stats.avgSuppliers" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import StatRow from '@/component/common/StatRow.vue'

defineProps<{
  stats: {
    totalShipments: number
    totalWeight: number
    avgSuppliers: number
  }
}>()
</script>
