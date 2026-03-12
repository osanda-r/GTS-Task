<template>
  <v-card class="metric-card" elevation="0" rounded="lg">
    <v-card-text class="pa-6">
      <div class="d-flex justify-space-between align-start">
        <div>
          <p class="text-body2 text-grey mb-2">{{ title }}</p>
          <h2 class="text-h4 font-weight-bold">{{ value }}</h2>
        </div>
        <v-avatar :color="iconColor" :icon="icon" size="56"></v-avatar>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  iconColor: string
}>()
</script>
