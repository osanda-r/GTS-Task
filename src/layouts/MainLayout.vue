<template>
  <v-app>
    <!-- Sidebar -->
    <Sidebar v-model="drawer" />

    <!-- Top Navigation Bar -->
    <TopNavBar @toggle-drawer="drawer = !drawer" />

    <!-- Main Content Area -->
    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopNavBar from '@/component/TopNavBar.vue'
import Sidebar from '@/component/Sidebar.vue'

const drawer = ref(true)
</script>
