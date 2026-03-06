<template>
  <v-theme-provider theme="light">
    <v-app>
      <v-main>
        <RouterView />
      </v-main>
    </v-app>
  </v-theme-provider>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
