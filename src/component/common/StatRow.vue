<template>
  <div class="stat-item d-flex justify-space-between py-2" :class="{ 'border-bottom': withBorder }">
    <span class="text-body2">{{ label }}</span>
    <span class="font-weight-bold" :class="valueClass">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  withBorder?: boolean
  valueClass?: string
}>()
</script>
