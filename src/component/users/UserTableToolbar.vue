<template>
  <div class="table-head px-6 py-4 d-flex flex-wrap align-center">
    <div class="d-flex align-center mr-6 mb-3 mb-md-0">
      <v-icon icon="mdi-account-multiple" size="28" class="mr-3"></v-icon>
      <h3 class="text-h5 font-weight-bold mr-3">Users</h3>
      <v-chip color="primary" variant="tonal">{{ recordCount }} Users</v-chip>
    </div>

    <v-spacer></v-spacer>

    <v-text-field
      :model-value="search"
      placeholder="Search users..."
      prepend-inner-icon="mdi-magnify"
      hide-details
      variant="outlined"
      density="comfortable"
      rounded="pill"
      class="search-input mr-4 mb-3 mb-md-0"
      @update:model-value="$emit('update:search', $event)"
    ></v-text-field>

    <div class="d-flex align-center flex-wrap action-buttons">
      <v-btn
        color="info"
        variant="tonal"
        rounded="pill"
        prepend-icon="mdi-refresh"
        :loading="isLoading"
        @click="$emit('refresh')"
      >
        Refresh
      </v-btn>
      <v-btn
        color="success"
        variant="tonal"
        rounded="pill"
        prepend-icon="mdi-download"
        @click="$emit('export')"
      >
        Export
      </v-btn>
      <v-btn
        color="success"
        variant="tonal"
        rounded="pill"
        prepend-icon="mdi-upload"
        @click="$emit('import')"
      >
        Import
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  recordCount: number
  isLoading: boolean
}>()

defineEmits<{
  'update:search': [value: string]
  refresh: []
  export: []
  import: []
}>()
</script>

<style scoped>
.table-head {
  background: #dfe4e8;
}

.search-input {
  min-width: 300px;
  max-width: 420px;
}

.action-buttons {
  gap: 10px;
}
</style>
