<template>
  <v-dialog :model-value="modelValue" max-width="650" @update:model-value="onDialogChange">
    <v-card>
      <v-card-title class="text-h6">Goods Received Details</v-card-title>
      <v-card-text v-if="record" class="pt-4">
        <v-row dense>
          <v-col cols="6"><strong>GRN:</strong> {{ record.grn }}</v-col>
          <v-col cols="6"><strong>Color:</strong> {{ record.color }}</v-col>
          <v-col cols="6"><strong>Type:</strong> {{ record.type }}</v-col>
          <v-col cols="6"><strong>Gross Weight:</strong> {{ record.grossWeight }} Kg</v-col>
          <v-col cols="6"><strong>Moisture:</strong> {{ record.moisture }} %</v-col>
          <v-col cols="6"><strong>Actual Weight:</strong> {{ record.actualWeight }} Kg</v-col>
          <v-col cols="6"><strong>Supplier:</strong> {{ record.supplier || '-' }}</v-col>
          <v-col cols="6"><strong>Created At:</strong> {{ record.createdAtDisplay }}</v-col>
          <v-col cols="12"><strong>Remark:</strong> {{ record.remark || '-' }}</v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="$emit('update:modelValue', false)"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface GoodsViewRecord {
  grn: string
  color: string
  type: string
  grossWeight: number
  moisture: number
  actualWeight: number
  supplier: string
  remark: string
  createdAtDisplay: string
}

defineProps<{
  modelValue: boolean
  record: GoodsViewRecord | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const onDialogChange = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>
