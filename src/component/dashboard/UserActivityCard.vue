<template>
  <v-card elevation="0" rounded="lg">
    <v-card-text class="pa-6">
      <h3 class="text-h6 font-weight-bold mb-4">User Activity</h3>
      <StatRow label="Total Users" :value="stats.totalUsers" with-border />
      <StatRow
        label="Active Users"
        :value="stats.activeUsers"
        value-class="text-success"
        with-border
      />
      <StatRow label="Inactive Users" :value="stats.inactiveUsers" value-class="text-error" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import StatRow from '../common/StatRow.vue'

type UserActivityStats = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
}

defineProps<{
  stats: UserActivityStats
}>()
</script>
