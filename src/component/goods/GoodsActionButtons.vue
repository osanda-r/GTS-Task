<template>
  <div class="d-flex flex-column align-center py-2">
    <v-btn
      v-if="showView"
      icon="mdi-eye"
      size="small"
      variant="text"
      color="grey-darken-3"
      @click="$emit('view')"
    ></v-btn>
    <v-btn
      v-if="canEdit"
      icon="mdi-pencil"
      size="small"
      variant="text"
      color="info"
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
  showView: boolean
  canEdit: boolean
  canDelete: boolean
}>()

defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>
