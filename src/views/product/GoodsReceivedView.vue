<template>
  <v-container fluid class="goods-page">
    <v-card class="form-card mb-6" elevation="2" rounded="lg">
      <div class="form-title-bar px-6 py-4 d-flex align-center">
        <v-icon icon="mdi-truck-delivery-outline" class="mr-3" size="28"></v-icon>
        <h2 class="text-h5 font-weight-medium">Goods Received</h2>
      </div>

      <v-card-text class="pt-6 pb-4">
        <v-row dense>
          <v-col cols="12" md="2">
            <label class="field-label">Color</label>
            <v-select
              v-model="form.color"
              :items="colors"
              placeholder="Select Color"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <label class="field-label">Type</label>
            <v-select
              v-model="form.type"
              :items="types"
              placeholder="Select Type"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <label class="field-label">Gross Weight (Kg)</label>
            <v-text-field
              v-model="form.grossWeight"
              placeholder="Enter Gross Weight"
              variant="outlined"
              density="comfortable"
              :error="showWeightError"
              hide-details="auto"
              rounded="lg"
              @blur="touched.grossWeight = true"
            ></v-text-field>
            <div v-if="showWeightError" class="required-text mt-1">This field is required</div>
          </v-col>

          <v-col cols="12" md="2">
            <label class="field-label">Moisture (%)</label>
            <v-text-field
              v-model="form.moisture"
              placeholder="Enter Moisture %"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="2">
            <label class="field-label">Supplier (Optional)</label>
            <v-select
              v-model="form.supplier"
              :items="suppliers"
              placeholder="Select Supplier"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <label class="field-label">Remark</label>
            <v-textarea
              v-model="form.remark"
              placeholder="Enter Remark"
              variant="outlined"
              density="comfortable"
              hide-details
              rows="1"
              auto-grow
              rounded="lg"
            ></v-textarea>
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-6">
          <v-btn class="mr-3" color="grey-lighten-4" variant="elevated" @click="clearForm">
            CLEAR
          </v-btn>
          <v-btn color="success" variant="flat" @click="saveRecord">SAVE</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="table-card" elevation="2" rounded="lg">
      <v-card-text class="px-0 py-0">
        <div class="table-head px-6 py-4 d-flex flex-wrap align-center">
          <div class="d-flex align-center mr-6 mb-3 mb-md-0">
            <v-icon icon="mdi-cube-outline" size="28" class="mr-3"></v-icon>
            <h3 class="text-h5 font-weight-bold mr-3">Goods Received</h3>
            <v-chip color="success" variant="tonal">{{ filteredGoods.length }} Records</v-chip>
          </div>

          <v-spacer></v-spacer>

          <v-text-field
            v-model="search"
            placeholder="Search goods received..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            variant="outlined"
            density="comfortable"
            rounded="pill"
            class="search-input mr-4 mb-3 mb-md-0"
          ></v-text-field>

          <div class="d-flex align-center gap-2 flex-wrap">
            <v-btn
              color="info"
              variant="tonal"
              rounded="pill"
              prepend-icon="mdi-refresh"
              :loading="isLoading"
              @click="loadGoods"
            >
              Refresh
            </v-btn>
            <v-btn color="success" variant="tonal" rounded="pill" prepend-icon="mdi-download">
              Export
            </v-btn>
            <v-btn color="success" variant="tonal" rounded="pill" prepend-icon="mdi-upload">
              Import
            </v-btn>
          </div>
        </div>

        <v-data-table
          :headers="headers"
          :items="filteredGoods"
          :loading="isLoading"
          item-value="id"
          class="goods-table"
          hide-default-footer
          no-data-text="No records found"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex flex-column align-center py-2">
              <v-btn icon="mdi-eye" size="small" variant="text" color="grey-darken-3"></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteRecord(item.id)"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-btn class="floating-menu" color="success" icon="mdi-menu" size="56" elevation="8"></v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/plugins/firebase'

type GoodsRecord = {
  id: string
  grn: string
  color: string
  type: string
  grossWeight: number
  moisture: number
  actualWeight: number
  supplier: string
  remark: string
  createdAt: Timestamp | string | null
  createdAtDisplay: string
}

const goodsCollection = collection(db, 'goodsReceived')

const search = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const form = ref({
  color: null as string | null,
  type: null as string | null,
  grossWeight: '',
  moisture: '',
  supplier: null as string | null,
  remark: '',
})

const touched = ref({
  grossWeight: false,
})

const showWeightError = computed(() => touched.value.grossWeight && !form.value.grossWeight.trim())

const headers = [
  { title: 'GRN', key: 'grn' },
  { title: 'Color', key: 'color' },
  { title: 'Type', key: 'type' },
  { title: 'Gross Weight (Kg)', key: 'grossWeight' },
  { title: 'Moisture (%)', key: 'moisture' },
  { title: 'Actual Weight (Kg)', key: 'actualWeight' },
  { title: 'Supplier', key: 'supplier' },
  { title: 'Remark', key: 'remark' },
  { title: 'Created At', key: 'createdAtDisplay' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const goods = ref<GoodsRecord[]>([])

const colors = computed(() => {
  return Array.from(new Set(goods.value.map((g) => g.color).filter(Boolean)))
})

const types = computed(() => {
  return Array.from(new Set(goods.value.map((g) => g.type).filter(Boolean)))
})

const suppliers = computed(() => {
  return Array.from(new Set(goods.value.map((g) => g.supplier).filter(Boolean)))
})

const toDisplayDate = (value: Timestamp | string | null) => {
  if (!value) return '-'
  const date = value instanceof Timestamp ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-US').format(date)
}

const mapDocToRecord = (id: string, data: Record<string, unknown>): GoodsRecord => {
  const createdAt = (data.createdAt as Timestamp | string | null) ?? null
  return {
    id,
    grn: String(data.grn ?? ''),
    color: String(data.color ?? ''),
    type: String(data.type ?? ''),
    grossWeight: Number(data.grossWeight ?? 0),
    moisture: Number(data.moisture ?? 0),
    actualWeight: Number(data.actualWeight ?? 0),
    supplier: String(data.supplier ?? ''),
    remark: String(data.remark ?? ''),
    createdAt,
    createdAtDisplay: toDisplayDate(createdAt),
  }
}

const loadGoods = async () => {
  isLoading.value = true
  try {
    const q = query(goodsCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    goods.value = snapshot.docs.map((row) => mapDocToRecord(row.id, row.data()))
  } catch (error) {
    console.error('Failed to load goods received records:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredGoods = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return goods.value

  return goods.value.filter((row) => {
    return Object.values(row).some((value) => String(value).toLowerCase().includes(query))
  })
})

const clearForm = () => {
  form.value = {
    color: null,
    type: null,
    grossWeight: '',
    moisture: '',
    supplier: null,
    remark: '',
  }
  touched.value.grossWeight = false
}

const makeGrn = () => {
  const now = Date.now().toString().slice(-5)
  return `GRN-${now}`
}

const saveRecord = async () => {
  touched.value.grossWeight = true
  if (showWeightError.value || isSaving.value) return

  const grossWeight = Number(form.value.grossWeight)
  const moisture = Number(form.value.moisture || 0)
  if (!Number.isFinite(grossWeight) || grossWeight <= 0) return

  isSaving.value = true
  try {
    const actualWeight = Math.max(grossWeight - moisture, 0)
    await addDoc(goodsCollection, {
      grn: makeGrn(),
      color: form.value.color ?? '',
      type: form.value.type ?? '',
      grossWeight,
      moisture,
      actualWeight,
      supplier: form.value.supplier ?? '',
      remark: form.value.remark,
      createdAt: serverTimestamp(),
    })

    clearForm()
    await loadGoods()
  } catch (error) {
    console.error('Failed to save goods received record:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteRecord = async (id?: string) => {
  if (!id) return
  try {
    await deleteDoc(doc(db, 'goodsReceived', id))
    await loadGoods()
  } catch (error) {
    console.error('Failed to delete record:', error)
  }
}

onMounted(() => {
  loadGoods()
})

onBeforeUnmount(() => {
  // No persistent listeners are used; method kept for lifecycle symmetry.
})
</script>

<style scoped>
.goods-page {
  background: #eceff1;
  min-height: calc(100vh - 64px);
  padding: 22px;
}

.form-card,
.table-card {
  background: #f3f4f6;
}

.form-title-bar {
  background: #2f8533;
  color: #fff;
}

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

.table-head {
  background: #dfe4e8;
}

.search-input {
  min-width: 300px;
  max-width: 420px;
}

.goods-table :deep(.v-data-table__th) {
  background: #fff;
  color: #37474f;
  font-size: 15px;
  font-weight: 600;
}

.goods-table :deep(tbody tr) {
  border-bottom: 1px solid #e3e7ea;
}

.floating-menu {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 10;
}

@media (max-width: 960px) {
  .goods-page {
    padding: 12px;
  }

  .search-input {
    min-width: 100%;
    margin-right: 0;
  }
}
</style>
