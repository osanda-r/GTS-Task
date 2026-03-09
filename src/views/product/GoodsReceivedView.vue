<template>
  <v-container fluid class="goods-page">
    <v-card v-if="canCreate" class="form-card mb-6" elevation="2" rounded="lg">
      <div class="form-title-bar px-6 py-4 d-flex align-center">
        <v-icon icon="mdi-truck-delivery-outline" class="mr-3" size="28"></v-icon>
        <h2 class="text-h5 font-weight-medium">Goods Received</h2>
      </div>

      <v-card-text class="pt-6 pb-4">
        <v-row dense>
          <v-col cols="12" md="2">
            <label class="field-label">Color</label>
            <v-text-field
              v-model="form.color"
              placeholder="Enter Color"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="2">
            <label class="field-label">Type</label>
            <v-text-field
              v-model="form.type"
              placeholder="Enter Type"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-text-field>
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
            <v-text-field
              v-model="form.supplier"
              placeholder="Enter Supplier"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
            ></v-text-field>
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
          <v-btn color="success" variant="flat" :loading="isSaving" @click="saveRecord">SAVE</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="canView" class="table-card" elevation="2" rounded="lg">
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

          <div v-if="!hasOnlyViewPermission" class="d-flex align-center gap-2 flex-wrap">
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
          <template v-if="canShowActions" v-slot:[`item.actions`]="{ item }">
            <div class="d-flex flex-column align-center py-2">
              <v-btn
                v-if="canView && !hasOnlyViewPermission"
                icon="mdi-eye"
                size="small"
                variant="text"
                color="grey-darken-3"
                @click="openViewDialog(item)"
              ></v-btn>
              <v-btn
                v-if="canEdit"
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="info"
                @click="openEditDialog(item)"
              ></v-btn>
              <v-btn
                v-if="canDelete"
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

    <v-card v-else class="table-card" elevation="2" rounded="lg">
      <v-card-text class="py-8 text-center text-medium-emphasis">
        You do not have permission to view goods received records.
      </v-card-text>
    </v-card>

    <v-dialog v-model="isViewDialogOpen" max-width="650">
      <v-card>
        <v-card-title class="text-h6">Goods Received Details</v-card-title>
        <v-card-text v-if="selectedRecord" class="pt-4">
          <v-row dense>
            <v-col cols="6"><strong>GRN:</strong> {{ selectedRecord.grn }}</v-col>
            <v-col cols="6"><strong>Color:</strong> {{ selectedRecord.color }}</v-col>
            <v-col cols="6"><strong>Type:</strong> {{ selectedRecord.type }}</v-col>
            <v-col cols="6"
              ><strong>Gross Weight:</strong> {{ selectedRecord.grossWeight }} Kg</v-col
            >
            <v-col cols="6"><strong>Moisture:</strong> {{ selectedRecord.moisture }} %</v-col>
            <v-col cols="6"
              ><strong>Actual Weight:</strong> {{ selectedRecord.actualWeight }} Kg</v-col
            >
            <v-col cols="6"><strong>Supplier:</strong> {{ selectedRecord.supplier || '-' }}</v-col>
            <v-col cols="6"
              ><strong>Created At:</strong> {{ selectedRecord.createdAtDisplay }}</v-col
            >
            <v-col cols="12"><strong>Remark:</strong> {{ selectedRecord.remark || '-' }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="isViewDialogOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEditDialogOpen" max-width="760">
      <v-card>
        <v-card-title class="text-h6">Edit Goods Received</v-card-title>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12" md="6">
              <label class="field-label">Color</label>
              <v-text-field
                v-model="editForm.color"
                placeholder="Enter Color"
                variant="outlined"
                density="comfortable"
                hide-details
                rounded="lg"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Type</label>
              <v-text-field
                v-model="editForm.type"
                placeholder="Enter Type"
                variant="outlined"
                density="comfortable"
                hide-details
                rounded="lg"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Gross Weight (Kg)</label>
              <v-text-field
                v-model="editForm.grossWeight"
                placeholder="Enter Gross Weight"
                variant="outlined"
                density="comfortable"
                :error="showEditWeightError"
                hide-details="auto"
                rounded="lg"
                @blur="editTouched.grossWeight = true"
              ></v-text-field>
              <div v-if="showEditWeightError" class="required-text mt-1">
                This field is required
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Moisture (%)</label>
              <v-text-field
                v-model="editForm.moisture"
                placeholder="Enter Moisture %"
                variant="outlined"
                density="comfortable"
                hide-details
                rounded="lg"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Supplier (Optional)</label>
              <v-text-field
                v-model="editForm.supplier"
                placeholder="Enter Supplier"
                variant="outlined"
                density="comfortable"
                hide-details
                rounded="lg"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Remark</label>
              <v-textarea
                v-model="editForm.remark"
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
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isEditDialogOpen = false">Cancel</v-btn>
          <v-btn color="success" :loading="isUpdating" @click="updateRecord">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      v-if="!hasOnlyViewPermission"
      class="floating-menu"
      color="success"
      icon="mdi-menu"
      size="56"
      elevation="8"
    ></v-btn>

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
  grossWeight: false,
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
  grossWeight: false,
})

const showWeightError = computed(() => touched.value.grossWeight && !form.value.grossWeight.trim())
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
  touched.value.grossWeight = false
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
  if (showEditWeightError.value || isUpdating.value) return

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
      color: editForm.value.color ?? '',
      type: editForm.value.type ?? '',
      grossWeight,
      moisture,
      actualWeight,
      supplier: editForm.value.supplier ?? '',
      remark: editForm.value.remark ?? '',
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

  touched.value.grossWeight = true
  if (showWeightError.value || isSaving.value) return

  const grossWeight = Number(form.value.grossWeight)
  const moisture = Number(form.value.moisture || 0)
  if (!Number.isFinite(grossWeight) || grossWeight <= 0) {
    showToast('Gross weight must be greater than 0.', 'warning')
    return
  }

  isSaving.value = true
  try {
    const hasSession = await ensureFirebaseSession()
    if (!hasSession) return

    const grn = await getNextGRN()
    const actualWeight = Math.max(grossWeight - moisture, 0)
    const docRef = await addDoc(goodsCollection, {
      grn,
      color: form.value.color ?? '',
      type: form.value.type ?? '',
      grossWeight,
      moisture,
      actualWeight,
      supplier: form.value.supplier ?? '',
      remark: form.value.remark,
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
