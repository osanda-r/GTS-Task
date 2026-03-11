<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">User Details</v-card-title>
      <v-card-text v-if="user">
        <div class="mb-2"><strong>Name:</strong> {{ user.name }}</div>
        <div class="mb-2"><strong>Email:</strong> {{ user.email }}</div>
        <div class="mb-2"><strong>Role:</strong> {{ user.role }}</div>
        <div><strong>Status:</strong> {{ user.status }}</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
type UserDialogRecord = {
  name: string
  email: string
  role: string
  status: string
}

defineProps<{
  modelValue: boolean
  user: UserDialogRecord | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
