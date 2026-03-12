<template>
  <v-card elevation="0" rounded="lg" class="products-card">
    <v-card-text class="pa-6">
      <h3 class="text-h6 font-weight-bold mb-4">Top Products</h3>
      <div v-if="products.length" class="products-list">
        <div
          v-for="(product, index) in products"
          :key="`${product.name}-${index}`"
          class="product-item mb-4"
        >
          <div class="d-flex gap-3 align-start">
            <v-avatar :color="product.color" size="48" :icon="product.icon"></v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-body1 font-weight-bold">{{ product.name }}</h4>
              <p class="text-body2 text-grey mb-1">
                {{ product.units.toLocaleString() }} units sold
              </p>
              <p class="text-body2 text-success font-weight-bold">
                Rs:{{ product.price.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-body2 text-medium-emphasis">No products added yet.</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface TopProductItem {
  name: string
  units: number
  price: number
  color: string
  icon: string
}

defineProps<{
  products: TopProductItem[]
}>()
</script>

<style scoped>
.products-card {
  background: #fff !important;
  border: 1px solid #e0e0e0;
}

.product-item {
  padding-bottom: 16px;
}

.product-item:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.products-list {
  max-height: 450px;
  overflow-y: auto;
}

.gap-3 {
  gap: 12px;
}

.text-grey {
  color: #999;
}
</style>
