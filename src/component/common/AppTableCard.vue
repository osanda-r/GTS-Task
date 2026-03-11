<template>
  <v-card :class="cardClass" :elevation="elevation" :rounded="rounded">
    <v-card-text :class="contentClass">
      <slot name="toolbar" />
      <slot name="table" />
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    cardClass?: string
    contentClass?: string
    elevation?: number
    rounded?: string
  }>(),
  {
    cardClass: 'table-card',
    contentClass: 'px-0 py-0',
    elevation: 2,
    rounded: 'lg',
  },
)
</script>
