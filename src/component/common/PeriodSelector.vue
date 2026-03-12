<template>
  <div class="d-flex gap-2">
    <v-btn
      v-for="period in periods"
      :key="period"
      size="small"
      :variant="modelValue === period ? 'tonal' : 'text'"
      @click="$emit('update:modelValue', period)"
    >
      {{ period }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const periods = ['WEEK', 'MONTH', 'YEAR'] as const

defineProps<{
  modelValue: 'WEEK' | 'MONTH' | 'YEAR'
}>()

defineEmits<{
  'update:modelValue': [value: 'WEEK' | 'MONTH' | 'YEAR']
}>()
</script>
