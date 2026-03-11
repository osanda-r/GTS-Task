<template>
  <v-container fluid class="add-product-page">
    <PageHeader
      title="Add Product"
      subtitle="Create products and manage existing items."
      show-back
      container-class="mb-4"
      @back="goBack"
    />

    <v-card class="form-card mb-6" elevation="2" rounded="lg">
      <v-card-text class="pa-6">
        <v-row dense>
          <v-col cols="12" md="6">
            <FormField
              label="Product Name"
              v-model="form.name"
              placeholder="Enter product name"
              :error="showNameError"
              :show-required-text="showNameError"
              required-text="Product name is required"
              @blur="touched.name = true"
            />
          </v-col>

          <v-col cols="12" md="3">
            <FormField
              label="Units Sold"
              v-model="form.units"
              placeholder="Enter units"
              :error="showUnitsError"
              :show-required-text="showUnitsError"
              required-text="Units must be greater than 0"
              @blur="touched.units = true"
            />
          </v-col>

          <v-col cols="12" md="3">
            <FormField
              label="Price (RS)"
              v-model="form.price"
              placeholder="Enter price"
              :error="showPriceError"
              :show-required-text="showPriceError"
              required-text="Price must be 0 or greater"
              @blur="touched.price = true"
            />
          </v-col>

          <v-col cols="12" md="6">
            <label class="field-label">Card Color</label>
            <v-select
              v-model="form.color"
              :items="colorOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.title">
                  <template #prepend>
                    <span class="color-dot" :style="{ backgroundColor: item.raw.hex }"></span>
                  </template>
                </v-list-item>
              </template>

              <template #selection="{ item }">
                <div class="d-flex align-center ga-2">
                  <span class="color-dot" :style="{ backgroundColor: item.raw.hex }"></span>
                  <span>{{ item.raw.title }}</span>
                </div>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="6">
            <label class="field-label">Product Type</label>
            <v-select
              v-model="form.type"
              :items="productTypeOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-select>
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-6 ga-3">
          <v-btn variant="text" @click="clearForm">Clear</v-btn>
          <v-btn v-if="editingProductId" variant="text" color="warning" @click="cancelEdit">
            Cancel Edit
          </v-btn>
          <v-btn color="success" :loading="isSaving" @click="saveProduct">
            {{ editingProductId ? 'Update Product' : 'Save Product' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <AppTableCard card-class="form-card">
      <template #toolbar>
        <GoodsTableToolbar
          :search="search"
          :record-count="filteredProducts.length"
          :is-loading="isLoading"
          :has-action-permission="true"
          title="Products"
          icon="mdi-package-variant-closed"
          chip-color="primary"
          search-placeholder="Search products..."
          :show-export-import="true"
          @update:search="search = $event"
          @refresh="loadProducts"
          @export="handleExport"
          @import="handleImport"
        />
      </template>

      <template #table>
        <AppDataTable
          :headers="headers"
          :items="filteredProducts"
          :loading="isLoading"
          :items-per-page="10"
          item-value="id"
          table-class="products-table"
          no-data-text="No products found"
        >
          <template v-slot:[`item.price`]="{ item }">
            <span>RS:{{ asProduct(item).price.toLocaleString() }}</span>
          </template>

          <template v-slot:[`item.color`]="{ item }">
            <div class="d-flex align-center ga-2">
              <span
                class="color-dot"
                :style="{ backgroundColor: getColorHexByValue(asProduct(item).color) }"
              ></span>
              <span>{{ getColorLabelByValue(asProduct(item).color) }}</span>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="product-actions-cell">
              <GoodsActionButtons
                :show-view="false"
                :can-edit="true"
                :can-delete="true"
                :vertical="false"
                @edit="startEdit(asProduct(item))"
                @delete="removeProduct(asProduct(item).id)"
              />
            </div>
          </template>
        </AppDataTable>
      </template>
    </AppTableCard>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { db } from '@/plugins/firebase'
import PageHeader from '@/component/common/PageHeader.vue'
import FormField from '@/component/common/FormField.vue'
import AppTableCard from '@/component/common/AppTableCard.vue'
import AppDataTable from '@/component/common/AppDataTable.vue'
import GoodsTableToolbar from '@/component/goods/GoodsTableToolbar.vue'
import GoodsActionButtons from '@/component/goods/GoodsActionButtons.vue'
import {
  getProductIconByType,
  normalizeProductType,
  productTypeOptions,
} from '@/helpers/utils/productIconUtils'
import {
  exportExcelFile,
  getCellValue,
  pickExcelFile,
  readExcelFile,
} from '@/helpers/utils/excelUtils'

type ProductRecord = {
  id: string
  name: string
  type: string
  units: number
  price: number
  color: string
  icon: string
}

type ColorOption = {
  title: string
  value: string
  hex: string
}

const router = useRouter()
const productsCollection = collection(db, 'products')

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Units', key: 'units', sortable: true },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Color', key: 'color', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: 120 },
]

const colorOptions: ColorOption[] = [
  { title: 'Green', value: 'success', hex: '#2e7d32' },
  { title: 'Blue', value: 'info', hex: '#0288d1' },
  { title: 'Amber', value: 'warning', hex: '#f9a825' },
  { title: 'Red', value: 'error', hex: '#d32f2f' },
  { title: 'Indigo', value: 'primary', hex: '#3949ab' },
  { title: 'Teal', value: 'secondary', hex: '#00897b' },
]

const getColorLabelByValue = (value: string) => {
  const match = colorOptions.find((option) => option.value === value)
  return match?.title ?? value
}

const getColorHexByValue = (value: string) => {
  const match = colorOptions.find((option) => option.value === value)
  return match?.hex ?? '#9e9e9e'
}

const resolveColorValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return 'success'

  const byValue = colorOptions.find((option) => option.value.toLowerCase() === normalized)
  if (byValue) return byValue.value

  const byTitle = colorOptions.find((option) => option.title.toLowerCase() === normalized)
  if (byTitle) return byTitle.value

  return 'success'
}

const resolveProductTypeValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return 'other'

  const byValue = productTypeOptions.find((option) => option.value === normalized)
  if (byValue) return byValue.value

  const byTitle = productTypeOptions.find((option) => option.title.toLowerCase() === normalized)
  if (byTitle) return byTitle.value

  return normalizeProductType(normalized)
}

const form = ref({
  name: '',
  type: 'other',
  units: '',
  price: '',
  color: 'success',
})

const touched = ref({
  name: false,
  units: false,
  price: false,
})

const products = ref<ProductRecord[]>([])
const search = ref('')
const editingProductId = ref<string | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

const asProduct = (value: unknown): ProductRecord => value as ProductRecord

const filteredProducts = computed(() => {
  const queryTerm = search.value.trim().toLowerCase()
  if (!queryTerm) return products.value

  return products.value.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(queryTerm))
  })
})

const showNameError = computed(() => touched.value.name && !form.value.name.trim())
const showUnitsError = computed(() => {
  if (!touched.value.units) return false
  const units = Number(form.value.units)
  return !Number.isFinite(units) || units <= 0
})
const showPriceError = computed(() => {
  if (!touched.value.price) return false
  const price = Number(form.value.price)
  return !Number.isFinite(price) || price < 0
})

const showToast = (text: string, color: 'success' | 'error' | 'warning' | 'info') => {
  snackbar.value = {
    show: true,
    text,
    color,
  }
}

const goBack = () => {
  router.push({ name: 'Dashboard' })
}

const clearForm = () => {
  form.value = {
    name: '',
    type: 'other',
    units: '',
    price: '',
    color: 'success',
  }
  touched.value = {
    name: false,
    units: false,
    price: false,
  }
}

const cancelEdit = () => {
  editingProductId.value = null
  clearForm()
}

const loadProducts = async () => {
  isLoading.value = true
  try {
    const productsQuery = query(productsCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(productsQuery)
    products.value = snapshot.docs.map((row) => {
      const data = row.data()
      return {
        id: row.id,
        name: String(data.name ?? ''),
        type: normalizeProductType(String(data.type ?? 'other')),
        units: Number(data.units ?? 0),
        price: Number(data.price ?? 0),
        color: String(data.color ?? 'success'),
        icon: String(data.icon ?? getProductIconByType(String(data.type ?? 'other'))),
      }
    })
  } catch (error) {
    console.error('Failed to load products:', error)
    showToast('Failed to load products.', 'error')
  } finally {
    isLoading.value = false
  }
}

const startEdit = (product: ProductRecord) => {
  editingProductId.value = product.id
  form.value = {
    name: product.name,
    type: normalizeProductType(product.type),
    units: String(product.units),
    price: String(product.price),
    color: product.color,
  }
  touched.value = {
    name: false,
    units: false,
    price: false,
  }
}

const removeProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id))
    products.value = products.value.filter((item) => item.id !== id)
    if (editingProductId.value === id) {
      cancelEdit()
    }
    showToast('Product deleted.', 'success')
  } catch (error) {
    console.error('Failed to delete product:', error)
    showToast('Failed to delete product.', 'error')
  }
}

const handleExport = () => {
  try {
    const rows = filteredProducts.value.map((item) => ({
      Name: item.name,
      Type: item.type,
      Units: item.units,
      Price: item.price,
      Color: getColorLabelByValue(item.color),
    }))

    exportExcelFile(rows, 'Products', `products-${new Date().toISOString().slice(0, 10)}.xlsx`)
    showToast('Products exported successfully.', 'success')
  } catch (error) {
    console.error('Failed to export products:', error)
    showToast('Failed to export products.', 'error')
  }
}

const handleImport = async () => {
  try {
    const file = await pickExcelFile()
    if (!file) return

    const rows = await readExcelFile(file)
    if (rows.length === 0) {
      showToast('The selected Excel file has no rows.', 'warning')
      return
    }

    let imported = 0

    for (const row of rows) {
      const name = getCellValue(row, ['name', 'product name'])
      const typeRaw = getCellValue(row, ['type', 'product type'])
      const unitsRaw = getCellValue(row, ['units', 'units sold'])
      const priceRaw = getCellValue(row, ['price', 'price (rs)'])
      const colorRaw = getCellValue(row, ['color', 'card color'])

      const units = Number(unitsRaw)
      const price = Number(priceRaw)

      if (!name || !Number.isFinite(units) || units <= 0 || !Number.isFinite(price) || price < 0) {
        continue
      }

      const type = resolveProductTypeValue(typeRaw)
      const color = resolveColorValue(colorRaw)

      await addDoc(productsCollection, {
        name: name.trim(),
        type,
        units,
        price,
        color,
        icon: getProductIconByType(type),
        createdAt: serverTimestamp(),
      })

      imported += 1
    }

    if (imported === 0) {
      showToast('No valid rows found to import.', 'warning')
      return
    }

    await loadProducts()
    showToast(`Imported ${imported} product(s) successfully.`, 'success')
  } catch (error) {
    console.error('Failed to import products:', error)
    showToast('Failed to import products.', 'error')
  }
}

const saveProduct = async () => {
  touched.value.name = true
  touched.value.units = true
  touched.value.price = true

  if (showNameError.value || showUnitsError.value || showPriceError.value || isSaving.value) {
    return
  }

  const units = Number(form.value.units)
  const price = Number(form.value.price)

  isSaving.value = true
  try {
    const normalizedName = form.value.name.trim()
    const normalizedType = normalizeProductType(form.value.type)
    const payload = {
      name: normalizedName,
      type: normalizedType,
      units,
      price,
      color: form.value.color,
      icon: getProductIconByType(normalizedType),
    }

    if (editingProductId.value) {
      await updateDoc(doc(db, 'products', editingProductId.value), payload)
      showToast('Product updated successfully.', 'success')
    } else {
      await addDoc(productsCollection, {
        ...payload,
        createdAt: serverTimestamp(),
      })
      showToast('Product saved successfully.', 'success')
    }

    cancelEdit()
    await loadProducts()
  } catch (error) {
    console.error('Failed to save product:', error)
    showToast('Failed to save product.', 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.add-product-page {
  min-height: calc(100vh - 64px);
  padding: 22px;
}

.form-card {
  background: #f3f4f6;
}

.field-label {
  display: inline-block;
  margin-bottom: 8px;
  color: #455a64;
  font-size: 14px;
}

.products-table :deep(.v-data-table__th) {
  background: #fff;
  color: #37474f;
  font-size: 15px;
  font-weight: 600;
}

.products-table :deep(td:last-child) {
  text-align: center;
}

.product-actions-cell {
  display: flex;
  justify-content: center;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.18);
}
</style>
