<template>
  <v-dialog :model-value="modelValue" max-width="760" @update:model-value="onDialogChange">
    <v-card>
      <v-card-title class="text-h6">Edit Goods Received</v-card-title>
      <v-card-text class="pt-4">
        <v-row dense>
          <v-col cols="12" md="6">
            <FormField
              label="Color"
              :model-value="form.color"
              placeholder="Enter Color"
              @update:model-value="(value) => updateField('color', value)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <FormField
              label="Type"
              :model-value="form.type"
              placeholder="Enter Type"
              @update:model-value="(value) => updateField('type', value)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <FormField
              label="Gross Weight (Kg)"
              :model-value="form.grossWeight"
              placeholder="Enter Gross Weight"
              :error="showWeightError"
              :show-required-text="showWeightError"
              required-text="This field is required"
              @update:model-value="(value) => updateField('grossWeight', value)"
              @blur="$emit('blurGrossWeight')"
            />
          </v-col>
          <v-col cols="12" md="6">
            <FormField
              label="Moisture (%)"
              :model-value="form.moisture"
              placeholder="Enter Moisture %"
              @update:model-value="(value) => updateField('moisture', value)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <FormField
              label="Supplier (Optional)"
              :model-value="form.supplier"
              placeholder="Enter Supplier"
              @update:model-value="(value) => updateField('supplier', value)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <FormField
              label="Remark"
              :model-value="form.remark"
              placeholder="Enter Remark"
              textarea
              @update:model-value="(value) => updateField('remark', value)"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="success" :loading="isUpdating" @click="$emit('submit')">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import FormField from '@/component/common/FormField.vue'

interface EditFormState {
  id: string
  color: string
  type: string
  grossWeight: string
  moisture: string
  supplier: string
  remark: string
}

const props = defineProps<{
  modelValue: boolean
  form: EditFormState
  showWeightError: boolean
  isUpdating: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:form': [value: EditFormState]
  blurGrossWeight: []
  submit: []
}>()

const updateField = (field: keyof EditFormState, value: string) => {
  emit('update:form', {
    ...props.form,
    [field]: value,
  })
}

const onDialogChange = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>
