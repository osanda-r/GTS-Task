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
            <v-btn color="info" variant="tonal" rounded="pill" prepend-icon="mdi-refresh">
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
          item-value="grn"
          class="goods-table"
          hide-default-footer
        >
          <template v-slot:[`item.actions`]>
            <div class="d-flex flex-column align-center py-2">
              <v-btn icon="mdi-eye" size="small" variant="text" color="grey-darken-3"></v-btn>
              <v-btn icon="mdi-delete" size="small" variant="text" color="error"></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-btn class="floating-menu" color="success" icon="mdi-menu" size="56" elevation="8"></v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type GoodsRecord = {
  grn: string
  color: string
  type: string
  grossWeight: number
  moisture: number
  actualWeight: number
  supplier: string
  remark: string
  createdAt: string
}

const colors = ['Water White', 'Brown', 'Golden']
const types = ['Virgin Coconut Oil', 'CH4', 'Coconut Cream']
const suppliers = ['Wanasinghe Holdings (Pvt) Ltd.', 'Eranga', 'N/A']

const search = ref('')
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
  { title: 'Created At', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const goods = ref<GoodsRecord[]>([
  {
    grn: 'GRN-005',
    color: 'Water White',
    type: 'Virgin Coconut Oil',
    grossWeight: 600,
    moisture: 0.002,
    actualWeight: 599.99,
    supplier: 'Wanasinghe Holdings (Pvt) Ltd.',
    remark: 'Good Quality',
    createdAt: '12/26/2025',
  },
  {
    grn: 'GRN-001',
    color: 'Brown',
    type: 'CH4',
    grossWeight: 100,
    moisture: 5,
    actualWeight: 95,
    supplier: 'Eranga',
    remark: 'This is test GRN',
    createdAt: '11/28/2025',
  },
  {
    grn: 'GRN-009',
    color: 'Golden',
    type: 'Coconut Cream',
    grossWeight: 250,
    moisture: 2.1,
    actualWeight: 247.5,
    supplier: 'N/A',
    remark: 'Sample intake',
    createdAt: '01/03/2026',
  },
])

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

const saveRecord = () => {
  touched.value.grossWeight = true
  if (showWeightError.value) return

  // Stub action to keep UI flow while backend is not connected.
  console.log('Saving goods received record', form.value)
}
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
