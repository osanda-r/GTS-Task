<template>
  <div>
    <label class="field-label">{{ label }}</label>

    <v-text-field
      v-if="!textarea"
      :model-value="modelValue"
      :placeholder="placeholder"
      variant="outlined"
      density="comfortable"
      :error="error"
      :hide-details="error ? 'auto' : true"
      rounded="lg"
      @update:model-value="$emit('update:modelValue', String($event ?? ''))"
      @blur="$emit('blur')"
    ></v-text-field>

    <v-textarea
      v-else
      :model-value="modelValue"
      :placeholder="placeholder"
      variant="outlined"
      density="comfortable"
      hide-details
      rows="1"
      auto-grow
      rounded="lg"
      @update:model-value="$emit('update:modelValue', String($event ?? ''))"
      @blur="$emit('blur')"
    ></v-textarea>

    <div v-if="showRequiredText && error" class="required-text mt-1">
      {{ requiredText }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string
  placeholder?: string
  textarea?: boolean
  error?: boolean
  showRequiredText?: boolean
  requiredText?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()
</script>

<style scoped>
.field-label {
  display: inline-block;
  margin-bottom: 8px;
  color: #455a64;
  font-size: 14px;
}

.required-text {
  color: #f44336;
  font-size: 14px;
}
</style>
