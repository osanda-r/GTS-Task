/**
 * plugins/formStore.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import router from '@/router'
import pinia from '@/stores'
import { firebaseApp } from './firebase'
import { VueFire, VueFireAuth } from 'vuefire';

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  app.use(router)
  app.use(vuetify)
  app.use(pinia)
  app.use(VueFire, { firebaseApp, modules: [VueFireAuth()] })
}
