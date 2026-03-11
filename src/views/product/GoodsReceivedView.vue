<template>
  <v-container fluid class="goods-page">
    <PageHeader
      title="Goods Received"
      subtitle="Manage received goods records and stock entries."
      container-class="mb-4"
    />

    <v-card v-if="canCreate" class="form-card mb-6" elevation="2" rounded="lg">
      <div class="form-title-bar px-6 py-4 d-flex align-center">
        <v-icon icon="mdi-truck-delivery-outline" class="mr-3" size="28"></v-icon>
        <h2 class="text-h5 font-weight-medium">Goods Received</h2>
      </div>

      <v-card-text class="pt-6 pb-4">
        <v-row dense>
          <v-col cols="12" md="2">
            <FormField
              label="Color"
              v-model="form.color"
              placeholder="Enter Color"
              :error="showColorError"
              :show-required-text="showColorError"
              required-text="Color is required"
              @blur="touched.color = true"
            />
          </v-col>

          <v-col cols="12" md="2">
            <FormField
              label="Type"
              v-model="form.type"
              placeholder="Enter Type"
              :error="showTypeError"
              :show-required-text="showTypeError"
              required-text="Type is required"
              @blur="touched.type = true"
            />
          </v-col>

          <v-col cols="12" md="2">
            <FormField
              label="Gross Weight (Kg)"
              v-model="form.grossWeight"
              placeholder="Enter Gross Weight"
              :error="showWeightError"
              :show-required-text="showWeightError"
              required-text="This field is required"
              @blur="touched.grossWeight = true"
            />
          </v-col>

          <v-col cols="12" md="2">
            <FormField
              label="Moisture (%)"
              v-model="form.moisture"
              placeholder="Enter Moisture %"
              :error="showMoistureError"
              :show-required-text="showMoistureError"
              :required-text="moistureErrorMessage"
              @blur="touched.moisture = true"
            />
          </v-col>

          <v-col cols="12" md="2">
            <FormField
              label="Supplier (Optional)"
              v-model="form.supplier"
              placeholder="Enter Supplier"
            />
          </v-col>

          <v-col cols="12" md="2">
            <FormField label="Remark" v-model="form.remark" placeholder="Enter Remark" textarea />
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-6">
          <v-btn class="mr-3" color="grey-lighten-4" variant="elevated" @click="clearForm">
            CLEAR
          </v-btn>
          <v-btn color="success" variant="flat" :loading="isSaving" @click="saveRecord">SAVE</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <AppTableCard v-if="canView" card-class="table-card">
      <template #toolbar>
        <GoodsTableToolbar
          :search="search"
          :record-count="filteredGoods.length"
          :is-loading="isLoading"
          :has-action-permission="!hasOnlyViewPermission"
          @update:search="search = $event"
          @refresh="loadGoods"
          @export="handleExport"
          @import="handleImport"
        />
      </template>

      <template #table>
        <AppDataTable
          :headers="headers"
          :items="filteredGoods"
          :loading="isLoading"
          :items-per-page="10"
          item-value="id"
          table-class="goods-table"
          no-data-text="No records found"
        >
          <template v-slot:[`mobile-card`]="{ item }">
            <v-card class="mobile-goods-card mb-3" variant="outlined">
              <v-card-text>
                <div class="d-flex justify-space-between align-start mb-3 ga-3">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ asGoodsRecord(item).grn }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ asGoodsRecord(item).createdAtDisplay }}
                    </div>
                  </div>
                  <v-chip color="success" variant="tonal">{{
                    asGoodsRecord(item).type || 'N/A'
                  }}</v-chip>
                </div>

                <div class="mobile-detail-grid">
                  <div>
                    <div class="text-caption text-medium-emphasis">Color</div>
                    <div class="text-body-2">{{ asGoodsRecord(item).color || '-' }}</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Supplier</div>
                    <div class="text-body-2">{{ asGoodsRecord(item).supplier || '-' }}</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Gross Weight</div>
                    <div class="text-body-2">{{ asGoodsRecord(item).grossWeight }} Kg</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Actual Weight</div>
                    <div class="text-body-2">{{ asGoodsRecord(item).actualWeight }} Kg</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Moisture</div>
                    <div class="text-body-2">{{ asGoodsRecord(item).moisture }} %</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Remark</div>
                    <div class="text-body-2">{{ asGoodsRecord(item).remark || '-' }}</div>
                  </div>
                </div>

                <div v-if="canShowActions" class="mt-3 pt-2 border-top-thin">
                  <GoodsActionButtons
                    :show-view="canView && !hasOnlyViewPermission"
                    :can-edit="canEdit"
                    :can-delete="canDelete"
                    :vertical="false"
                    @view="openViewDialog(asGoodsRecord(item))"
                    @edit="openEditDialog(asGoodsRecord(item))"
                    @delete="deleteRecord(asGoodsRecord(item).id)"
                  />
                </div>
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <GoodsActionButtons
              v-if="canShowActions"
              :show-view="canView && !hasOnlyViewPermission"
              :can-edit="canEdit"
              :can-delete="canDelete"
              @view="openViewDialog(asGoodsRecord(item))"
              @edit="openEditDialog(asGoodsRecord(item))"
              @delete="deleteRecord(asGoodsRecord(item).id)"
            />
          </template>
        </AppDataTable>
      </template>
    </AppTableCard>

    <v-card v-else class="table-card" elevation="2" rounded="lg">
      <v-card-text class="py-8 text-center text-medium-emphasis">
        You do not have permission to view goods received records.
      </v-card-text>
    </v-card>

    <GoodsViewDialog v-model="isViewDialogOpen" :record="selectedRecord" />

    <GoodsEditDialog
      v-model="isEditDialogOpen"
      :form="editForm"
      :show-weight-error="showEditWeightError"
      :is-updating="isUpdating"
      @update:form="editForm = $event"
      @blur-gross-weight="editTouched.grossWeight = true"
      @submit="updateRecord"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import type { FirebaseError } from 'firebase/app'
import { auth, db } from '@/plugins/firebase'
import PageHeader from '@/component/common/PageHeader.vue'
import FormField from '@/component/common/FormField.vue'
import AppDataTable from '@/component/common/AppDataTable.vue'
import AppTableCard from '@/component/common/AppTableCard.vue'
import GoodsActionButtons from '@/component/goods/GoodsActionButtons.vue'
import GoodsViewDialog from '@/component/goods/GoodsViewDialog.vue'
import GoodsEditDialog from '@/component/goods/GoodsEditDialog.vue'
import GoodsTableToolbar from '@/component/goods/GoodsTableToolbar.vue'
import { getNextGRN } from '@/helpers/utils/grnUtils'

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

const asGoodsRecord = (value: unknown): GoodsRecord => value as GoodsRecord

const goodsCollection = collection(db, 'goodsReceived')

const search = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isUpdating = ref(false)
const authWarningShown = ref(false)
const userPermissions = ref<string[]>([])
const userRole = ref<string>('')
const isViewDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const selectedRecord = ref<GoodsRecord | null>(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

const form = ref({
  color: '',
  type: '',
  grossWeight: '',
  moisture: '',
  supplier: '',
  remark: '',
})

const touched = ref({
  color: false,
  type: false,
  grossWeight: false,
  moisture: false,
})

const editForm = ref({
  id: '',
  color: '',
  type: '',
  grossWeight: '',
  moisture: '',
  supplier: '',
  remark: '',
})

const editTouched = ref({
  color: false,
  type: false,
  grossWeight: false,
  moisture: false,
})

const showColorError = computed(() => touched.value.color && !form.value.color.trim())
const showTypeError = computed(() => touched.value.type && !form.value.type.trim())
const showWeightError = computed(() => touched.value.grossWeight && !form.value.grossWeight.trim())
const showMoistureError = computed(() => {
  if (!touched.value.moisture) return false
  if (!form.value.moisture.trim()) return false
  const moisture = Number(form.value.moisture)
  return !Number.isFinite(moisture) || moisture < 0 || moisture > 100
})
const moistureErrorMessage = computed(() => {
  const moisture = Number(form.value.moisture)
  if (!Number.isFinite(moisture)) return 'Must be a valid number'
  if (moisture < 0) return 'Moisture cannot be negative'
  if (moisture > 100) return 'Moisture cannot exceed 100%'
  return 'Enter value between 0-100'
})

const showEditWeightError = computed(
  () => editTouched.value.grossWeight && !editForm.value.grossWeight.trim(),
)

// Permission checks
const isAdministrator = computed(() => userRole.value.toLowerCase() === 'administrator')
const canView = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.goods_received.view'),
)
const canCreate = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.goods_received.create'),
)
const canEdit = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.goods_received.edit'),
)
const canDelete = computed(
  () => isAdministrator.value || userPermissions.value.includes('page.goods_received.delete'),
)
const hasOnlyViewPermission = computed(
  () => canView.value && !canCreate.value && !canEdit.value && !canDelete.value,
)
const canShowActions = computed(
  () => canEdit.value || canDelete.value || (canView.value && !hasOnlyViewPermission.value),
)

const headers = computed(() => {
  const baseHeaders: Array<{ title: string; key: string; sortable?: boolean }> = [
    { title: 'GRN', key: 'grn' },
    { title: 'Color', key: 'color' },
    { title: 'Type', key: 'type' },
    { title: 'Gross Weight (Kg)', key: 'grossWeight' },
    { title: 'Moisture (%)', key: 'moisture' },
    { title: 'Actual Weight (Kg)', key: 'actualWeight' },
    { title: 'Supplier', key: 'supplier' },
    { title: 'Remark', key: 'remark' },
    { title: 'Created At', key: 'createdAtDisplay' },
  ]

  if (canShowActions.value) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false })
  }

  return baseHeaders
})

const goods = ref<GoodsRecord[]>([])

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

const sortByCreatedAtDesc = (rows: GoodsRecord[]) => {
  return [...rows].sort((a, b) => {
    const aTime =
      a.createdAt instanceof Timestamp
        ? a.createdAt.toMillis()
        : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0
    const bTime =
      b.createdAt instanceof Timestamp
        ? b.createdAt.toMillis()
        : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0
    return bTime - aTime
  })
}

const showToast = (text: string, color: 'success' | 'error' | 'warning' | 'info') => {
  snackbar.value = {
    show: true,
    text,
    color,
  }
}

const getFirebaseErrorMessage = (error: unknown) => {
  const e = error as FirebaseError | undefined
  const code = e?.code ?? 'unknown'

  switch (code) {
    case 'auth/configuration-not-found':
      return 'Firebase Auth is not configured for this project. Configure Auth or use Firestore rules that do not require auth.'
    case 'auth/admin-restricted-operation':
    case 'auth/operation-not-allowed':
      return 'Enable Anonymous sign-in in Firebase Console: Authentication -> Sign-in method -> Anonymous.'
    case 'permission-denied':
      return 'Permission denied. Update Firestore rules or sign in with an allowed user.'
    case 'unauthenticated':
      return 'Not authenticated. Please sign in before saving data.'
    case 'unavailable':
      return 'Firebase service unavailable. Check your internet connection.'
    case 'failed-precondition':
      return 'Firestore needs setup (database/index/rules). Check Firebase console.'
    case 'not-found':
      return 'Firestore database or collection not found.'
    default:
      return e?.message ?? 'Firebase request failed.'
  }
}

const ensureFirebaseSession = async () => {
  if (auth.currentUser) return true

  try {
    await signInAnonymously(auth)
    return true
  } catch (error) {
    const e = error as FirebaseError | undefined
    const code = e?.code ?? ''

    // If Auth is not configured, continue and let Firestore rules decide access.
    if (
      code === 'auth/configuration-not-found' ||
      code === 'auth/operation-not-allowed' ||
      code === 'auth/admin-restricted-operation'
    ) {
      if (!authWarningShown.value) {
        showToast(getFirebaseErrorMessage(error), 'warning')
        authWarningShown.value = true
      }
      return true
    }

    console.error('Anonymous sign-in failed:', error)
    showToast(getFirebaseErrorMessage(error), 'error')
    return false
  }
}

const loadUserPermissions = async () => {
  try {
    if (!auth.currentUser) return

    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (!userDoc.exists()) {
      userPermissions.value = []
      return
    }

    const roleName = String(userDoc.data().role ?? '').trim()
    userRole.value = roleName

    // Administrator has all permissions
    if (roleName.toLowerCase() === 'administrator') {
      userPermissions.value = [
        'page.goods_received.view',
        'page.goods_received.create',
        'page.goods_received.edit',
        'page.goods_received.delete',
      ]
      return
    }

    const roleSnapshot = await getDocs(
      query(collection(db, 'roles'), where('name', '==', roleName)),
    )
    const roleDoc = roleSnapshot.docs[0]
    const permissions = Array.isArray(roleDoc?.data().permissions)
      ? roleDoc.data().permissions.map((p: unknown) => String(p))
      : []

    userPermissions.value = permissions
  } catch (error) {
    console.error('Failed to load permissions:', error)
    userPermissions.value = []
  }
}

const loadGoods = async () => {
  isLoading.value = true
  try {
    const hasSession = await ensureFirebaseSession()
    if (!hasSession) return

    let snapshot
    try {
      const q = query(goodsCollection, orderBy('createdAt', 'desc'))
      snapshot = await getDocs(q)
    } catch {
      snapshot = await getDocs(goodsCollection)
    }
    const rows = snapshot.docs.map((row) => mapDocToRecord(row.id, row.data()))
    goods.value = sortByCreatedAtDesc(rows)
  } catch (error) {
    console.error('Failed to load goods received records:', error)
    showToast(getFirebaseErrorMessage(error), 'error')
  } finally {
    isLoading.value = false
  }
}

const filteredGoods = computed(() => {
  const queryTerm = search.value.trim().toLowerCase()
  if (!queryTerm) return goods.value

  return goods.value.filter((row) => {
    return Object.values(row).some((value) => String(value).toLowerCase().includes(queryTerm))
  })
})

const clearForm = () => {
  form.value = {
    color: '',
    type: '',
    grossWeight: '',
    moisture: '',
    supplier: '',
    remark: '',
  }
  touched.value = {
    color: false,
    type: false,
    grossWeight: false,
    moisture: false,
  }
}

const openViewDialog = (record: GoodsRecord) => {
  if (!canView.value) {
    showToast('You do not have permission to view records.', 'error')
    return
  }

  selectedRecord.value = record
  isViewDialogOpen.value = true
}

const openEditDialog = (record: GoodsRecord) => {
  if (!canEdit.value) {
    showToast('You do not have permission to edit records.', 'error')
    return
  }

  editForm.value = {
    id: record.id,
    color: record.color,
    type: record.type,
    grossWeight: String(record.grossWeight),
    moisture: String(record.moisture),
    supplier: record.supplier,
    remark: record.remark,
  }
  editTouched.value.grossWeight = false
  isEditDialogOpen.value = true
}

const updateRecord = async () => {
  if (!canEdit.value) {
    showToast('You do not have permission to edit records.', 'error')
    return
  }

  editTouched.value.grossWeight = true
  if (showEditWeightError.value) {
    showToast('Gross weight is required.', 'warning')
    return
  }

  if (isUpdating.value) return

  const grossWeight = Number(editForm.value.grossWeight)
  const moisture = Number(editForm.value.moisture || 0)
  if (!Number.isFinite(grossWeight) || grossWeight <= 0) {
    showToast('Gross weight must be greater than 0.', 'warning')
    return
  }

  isUpdating.value = true
  try {
    const hasSession = await ensureFirebaseSession()
    if (!hasSession) return

    const actualWeight = Math.max(grossWeight - moisture, 0)
    await updateDoc(doc(db, 'goodsReceived', editForm.value.id), {
      color: editForm.value.color.trim(),
      type: editForm.value.type.trim(),
      grossWeight,
      moisture,
      actualWeight,
      supplier: editForm.value.supplier.trim() ?? '',
      remark: editForm.value.remark.trim(),
    })

    goods.value = goods.value.map((row) => {
      if (row.id !== editForm.value.id) return row
      return {
        ...row,
        color: editForm.value.color,
        type: editForm.value.type,
        grossWeight,
        moisture,
        actualWeight,
        supplier: editForm.value.supplier,
        remark: editForm.value.remark,
      }
    })

    isEditDialogOpen.value = false
    showToast('Record updated successfully.', 'success')
  } catch (error) {
    console.error('Failed to update record:', error)
    showToast(getFirebaseErrorMessage(error), 'error')
  } finally {
    isUpdating.value = false
  }
}

const saveRecord = async () => {
  if (!canCreate.value) {
    showToast('You do not have permission to create records.', 'error')
    return
  }

  // Mark all fields as touched to show errors
  touched.value = {
    color: true,
    type: true,
    grossWeight: true,
    moisture: true,
  }

  // Check for validation errors
  if (showColorError.value) {
    showToast('Color is required.', 'warning')
    return
  }
  if (showTypeError.value) {
    showToast('Type is required.', 'warning')
    return
  }
  if (showWeightError.value) {
    showToast('Gross weight is required.', 'warning')
    return
  }
  if (showMoistureError.value) {
    showToast(moistureErrorMessage.value, 'warning')
    return
  }

  const grossWeight = Number(form.value.grossWeight)
  const moisture = Number(form.value.moisture || 0)
  if (!Number.isFinite(grossWeight) || grossWeight <= 0) {
    showToast('Gross weight must be greater than 0.', 'warning')
    return
  }

  if (isSaving.value) return
  isSaving.value = true
  try {
    const hasSession = await ensureFirebaseSession()
    if (!hasSession) return

    const grn = await getNextGRN()
    const actualWeight = Math.max(grossWeight - moisture, 0)
    const docRef = await addDoc(goodsCollection, {
      grn,
      color: form.value.color.trim(),
      type: form.value.type.trim(),
      grossWeight,
      moisture,
      actualWeight,
      supplier: form.value.supplier.trim() ?? '',
      remark: form.value.remark.trim(),
      createdAt: serverTimestamp(),
    })

    // Optimistic table update so users see the newly saved row immediately.
    const now = new Date().toISOString()
    goods.value = [
      {
        id: docRef.id,
        grn,
        color: form.value.color,
        type: form.value.type,
        grossWeight,
        moisture,
        actualWeight,
        supplier: form.value.supplier,
        remark: form.value.remark,
        createdAt: now,
        createdAtDisplay: toDisplayDate(now),
      },
      ...goods.value,
    ]

    clearForm()
    showToast('Record saved to Firebase successfully.', 'success')

    await loadGoods()
  } catch (error) {
    console.error('Failed to save goods received record:', error)
    showToast(getFirebaseErrorMessage(error), 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteRecord = async (id?: string) => {
  if (!canDelete.value) {
    showToast('You do not have permission to delete records.', 'error')
    return
  }

  if (!id) return
  try {
    const hasSession = await ensureFirebaseSession()
    if (!hasSession) return

    await deleteDoc(doc(db, 'goodsReceived', id))
    goods.value = goods.value.filter((row) => row.id !== id)
    showToast('Record deleted.', 'success')
    await loadGoods()
  } catch (error) {
    console.error('Failed to delete record:', error)
    showToast(getFirebaseErrorMessage(error), 'error')
  }
}

const handleExport = () => {
  showToast('Export functionality coming soon.', 'info')
}

const handleImport = () => {
  showToast('Import functionality coming soon.', 'info')
}

onMounted(() => {
  loadUserPermissions()
  loadGoods()
})

onBeforeUnmount(() => {
  // No persistent listeners are used; method kept for lifecycle symmetry.
})
</script>

<style scoped>
.goods-page {
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

.goods-table :deep(.v-data-table__th) {
  background: #fff;
  color: #37474f;
  font-size: 15px;
  font-weight: 600;
}

.goods-table :deep(tbody tr) {
  border-bottom: 1px solid #e3e7ea;
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

.mobile-goods-card {
  background: #fff;
  border-color: #d8dee3;
}

.mobile-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 600px) {
  .mobile-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
