<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4 font-weight-bold">Goods Received</h1>
          <v-btn color="primary" prepend-icon="mdi-plus"> Add New Goods </v-btn>
        </div>

        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Search goods..."
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="goods"
            :search="search"
            item-value="id"
            class="elevation-1"
          >
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon="mdi-eye" size="small" variant="text"></v-btn>
              <v-btn icon="mdi-pencil" size="small" variant="text"></v-btn>
              <v-btn icon="mdi-delete" size="small" variant="text" color="error"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Product Name', key: 'productName', sortable: true },
  { title: 'Supplier', key: 'supplier', sortable: true },
  { title: 'Quantity', key: 'quantity', sortable: true },
  { title: 'Date Received', key: 'dateReceived', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const goods = ref([
  {
    id: 1,
    productName: 'Organic Rice',
    supplier: 'Supplier ABC',
    quantity: 500,
    dateReceived: '2026-03-05',
    status: 'Received',
  },
  {
    id: 2,
    productName: 'Organic Wheat',
    supplier: 'Supplier XYZ',
    quantity: 300,
    dateReceived: '2026-03-04',
    status: 'Pending',
  },
  {
    id: 3,
    productName: 'Organic Corn',
    supplier: 'Supplier DEF',
    quantity: 200,
    dateReceived: '2026-03-03',
    status: 'Received',
  },
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Received':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'Rejected':
      return 'error'
    default:
      return 'grey'
  }
}
</script>
