<template>
  <div
    class="d-flex justify-space-between align-center mb-4 page-header-wrap"
    :class="containerClass"
  >
    <div class="d-flex align-center">
      <v-btn
        v-if="showBack"
        icon="mdi-arrow-left"
        variant="text"
        class="mr-2"
        @click="$emit('back')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        <p v-if="subtitle" class="text-body2 text-medium-emphasis mt-1">{{ subtitle }}</p>
      </div>
    </div>

    <div class="d-flex align-center">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  showBack?: boolean
  containerClass?: string
}>()

defineEmits<{
  back: []
}>()
</script>

<style scoped>
.page-header-wrap {
  gap: 12px;
  flex-wrap: wrap;
}
</style>
