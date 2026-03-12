<template>
  <div class="d-flex align-center gap-1">
    <v-btn
      v-if="canView"
      icon="mdi-eye"
      size="small"
      variant="text"
      color="info"
      @click="$emit('view')"
    ></v-btn>
    <v-btn
      v-if="canEdit"
      icon="mdi-pencil"
      size="small"
      variant="text"
      color="warning"
      @click="$emit('edit')"
    ></v-btn>
    <v-btn
      v-if="canDelete"
      icon="mdi-delete"
      size="small"
      variant="text"
      color="error"
      @click="$emit('delete')"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canView: boolean
  canEdit: boolean
  canDelete: boolean
}>()

defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>
