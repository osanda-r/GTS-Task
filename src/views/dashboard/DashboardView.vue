<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Dashboard</h1>

        <v-row>
          <!-- Stats Cards -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="2">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-grey mb-1">Total Products</p>
                  <h3 class="text-h5 font-weight-bold">1,234</h3>
                </div>
                <v-icon size="40" color="primary">mdi-package-variant</v-icon>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="2">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-grey mb-1">Goods Received</p>
                  <h3 class="text-h5 font-weight-bold">567</h3>
                </div>
                <v-icon size="40" color="success">mdi-truck-delivery</v-icon>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="2">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-grey mb-1">Active Users</p>
                  <h3 class="text-h5 font-weight-bold">89</h3>
                </div>
                <v-icon size="40" color="info">mdi-account-multiple</v-icon>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="2">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-grey mb-1">Total Roles</p>
                  <h3 class="text-h5 font-weight-bold">12</h3>
                </div>
                <v-icon size="40" color="warning">mdi-shield-account</v-icon>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activity -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card>
              <v-card-title>Recent Activity</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item prepend-icon="mdi-truck-delivery">
                    <v-list-item-title>New goods received from Supplier ABC</v-list-item-title>
                    <v-list-item-subtitle>2 hours ago</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item prepend-icon="mdi-account-plus">
                    <v-list-item-title>New user added: John Smith</v-list-item-title>
                    <v-list-item-subtitle>5 hours ago</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item prepend-icon="mdi-package-variant">
                    <v-list-item-title>Product inventory updated</v-list-item-title>
                    <v-list-item-subtitle>1 day ago</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Dashboard logic here
</script>
