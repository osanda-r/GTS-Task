<template>
  <div>
    <v-data-table
      v-if="!isMobile"
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :item-value="itemValue"
      :class="tableClass"
      :no-data-text="noDataText"
    >
      <template v-if="$slots['item.avatar']" v-slot:[`item.avatar`]="slotProps">
        <slot name="item.avatar" v-bind="slotProps" />
      </template>

      <template v-if="$slots['item.status']" v-slot:[`item.status`]="slotProps">
        <slot name="item.status" v-bind="slotProps" />
      </template>

      <template v-if="$slots['item.actions']" v-slot:[`item.actions`]="slotProps">
        <slot name="item.actions" v-bind="slotProps" />
      </template>
    </v-data-table>

    <div v-else class="mobile-table">
      <div v-if="loading" class="mobile-state pa-6 text-center text-medium-emphasis">
        Loading...
      </div>
      <div
        v-else-if="!pagedItems.length"
        class="mobile-state pa-6 text-center text-medium-emphasis"
      >
        {{ noDataText }}
      </div>
      <div v-else class="mobile-card-list">
        <div v-for="(item, index) in pagedItems" :key="getItemKey(item, index)">
          <slot name="mobile-card" :item="item">
            <v-card class="mobile-data-card mb-3" variant="outlined">
              <v-card-text>
                <div
                  v-for="header in displayHeaders"
                  :key="header.key"
                  class="d-flex justify-space-between align-center py-2"
                >
                  <span class="text-caption text-medium-emphasis">{{ header.title }}</span>
                  <span class="text-body2 text-right">{{ getFieldValue(item, header.key) }}</span>
                </div>
              </v-card-text>
            </v-card>
          </slot>
        </div>
      </div>

      <div v-if="pageCount > 1" class="d-flex justify-center py-4">
        <v-pagination
          v-model="currentPage"
          :length="pageCount"
          :total-visible="5"
          density="comfortable"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

interface TableHeader {
  title: string
  key: string
  sortable?: boolean
}

const props = withDefaults(
  defineProps<{
    headers: TableHeader[]
    items: unknown[]
    loading?: boolean
    itemsPerPage?: number
    itemValue?: string
    tableClass?: string
    noDataText?: string
  }>(),
  {
    loading: false,
    itemsPerPage: 10,
    itemValue: 'id',
    tableClass: '',
    noDataText: 'No data found',
  },
)

const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)
const currentPage = ref(1)

const pageCount = computed(() => {
  return Math.max(1, Math.ceil(props.items.length / props.itemsPerPage))
})

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  return props.items.slice(start, start + props.itemsPerPage)
})

const displayHeaders = computed(() => {
  return props.headers.filter((header) => !['actions', 'avatar'].includes(header.key))
})

const getFieldValue = (item: unknown, key: string) => {
  if (typeof item !== 'object' || item === null) return ''
  const record = item as Record<string, unknown>
  return String(record[key] ?? '-')
}

const getItemKey = (item: unknown, index: number) => {
  if (typeof item !== 'object' || item === null) return index
  const record = item as Record<string, unknown>
  return String(record[props.itemValue] ?? index)
}

watch(
  () => [props.items.length, props.itemsPerPage],
  () => {
    if (currentPage.value > pageCount.value) {
      currentPage.value = 1
    }
  },
)

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'item.avatar'?: (props: { item: any }) => unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'item.status'?: (props: { item: any }) => unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'item.actions'?: (props: { item: any }) => unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'mobile-card'?: (props: { item: any }) => unknown
}>()
</script>

<style scoped>
.mobile-data-card {
  border-color: #d8dee3;
  background: #fff;
}

.mobile-card-list {
  padding: 12px;
}

.mobile-state {
  min-height: 140px;
}
</style>
