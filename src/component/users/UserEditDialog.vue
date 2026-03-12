<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">Edit User</v-card-title>
      <v-card-text>
        <v-text-field
          :model-value="form.name"
          label="Full Name"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          @update:model-value="updateField('name', $event)"
        ></v-text-field>

        <v-select
          :model-value="form.role"
          :items="roleOptions"
          label="Role"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          @update:model-value="updateField('role', String($event ?? ''))"
        ></v-select>

        <v-select
          :model-value="form.status"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateField('status', String($event ?? ''))"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="isUpdating" @click="emit('save')">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
type UserEditForm = {
  id: string
  name: string
  role: string
  status: string
}

const props = defineProps<{
  modelValue: boolean
  isUpdating: boolean
  form: UserEditForm
  roleOptions: string[]
  statusOptions: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:form': [value: UserEditForm]
  save: []
}>()

const updateField = (field: keyof UserEditForm, value: string) => {
  emit('update:form', {
    ...props.form,
    [field]: value,
  })
}
</script>
