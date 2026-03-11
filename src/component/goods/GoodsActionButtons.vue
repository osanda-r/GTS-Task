<template>
  <div
    :class="[
      'd-flex py-2',
      vertical ? 'flex-column align-center' : 'flex-row align-center justify-end ga-1',
    ]"
  >
    <v-btn
      v-if="showView"
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
withDefaults(
  defineProps<{
    showView: boolean
    canEdit: boolean
    canDelete: boolean
    vertical?: boolean
  }>(),
  {
    vertical: true,
  },
)

defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>
